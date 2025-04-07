<template>
  <v-app>
    <v-main class="d-flex align-center justify-center fill-height">
      <v-container class="pa-4" style="max-width: 900px;">
        <v-card elevation="12" class="pa-6 rounded-xl" style="max-height: 95vh; overflow-y: auto;">
          <v-card-title class="text-h4 text-primary text-center mb-6">
            <v-icon color="primary" size="40" class="mr-2">mdi-account-clock</v-icon>
            ABSENSI RFID
          </v-card-title>

          <v-form @submit.prevent="handleAttendance">
            <v-text-field
              ref="rfidInput"
              v-model="rfidNumber"
              label="Scan Kartu RFID Anda"
              outlined
              clearable
              color="primary"
              :loading="isLoading"
              :error-messages="errorMessage"
              autofocus
              @input="handleRfidInput"
              :disabled="isLoading"
            >
              <template v-slot:prepend>
                <v-icon color="primary">mdi-credit-card-scan</v-icon>
              </template>
            </v-text-field>

            <v-expand-transition>
              <div v-if="attendanceData">
                <v-divider class="my-4"></v-divider>

                <v-row>
                  <v-col cols="4" class="text-center">
                    <v-avatar size="120" class="elevation-4">
                      <v-img :src="attendanceData.user.photo_url" cover></v-img>
                    </v-avatar>
                  </v-col>

                  <v-col cols="8">
                    <v-list density="compact" class="bg-transparent">
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-account</v-icon>
                        </template>
                        <v-list-item-title class="text-h6">{{ attendanceData.user.name }}</v-list-item-title>
                      </v-list-item>

                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-card-account-details</v-icon>
                        </template>
                        <v-list-item-title>NIP: {{ attendanceData.user.nip }}</v-list-item-title>
                      </v-list-item>

                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-briefcase</v-icon>
                        </template>
                        <v-list-item-title>{{ attendanceData.user.position }} - {{ attendanceData.user.division }}</v-list-item-title>
                      </v-list-item>

                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-clock-outline</v-icon>
                        </template>
                        <v-list-item-title>
                          {{ attendanceType }}: {{ currentTime }}
                        </v-list-item-title>
                      </v-list-item>

                      <v-list-item v-if="attendanceData.attendance.status">
                        <template v-slot:prepend>
                          <v-icon>mdi-information-outline</v-icon>
                        </template>
                        <v-chip :color="statusColor" class="text-white">
                          {{ attendanceData.attendance.status }}
                        </v-chip>
                      </v-list-item>

                      <v-list-item v-if="attendanceData.attendance.message">
                        <template v-slot:prepend>
                          <v-icon>mdi-comment-text-outline</v-icon>
                        </template>
                        <v-list-item-title>{{ attendanceData.attendance.message }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>

                <!-- ✅ SUCCESS NOTIF BELOW DETAIL -->
                <v-alert
                  type="success"
                  variant="outlined"
                  class="mt-4"
                  prominent
                  border="top"
                  border-color="green"
                >
                  <v-icon class="mr-2">mdi-check-circle</v-icon>
                  {{ successMessage }}
                </v-alert>
              </div>
            </v-expand-transition>

            <!-- ❌ ERROR BELOW INPUT -->
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="mt-4"
            >
              <v-icon class="mr-2">mdi-alert-circle</v-icon>
              {{ errorMessage }}
            </v-alert>
          </v-form>
        </v-card>
      </v-container>

      <!-- ✅ SNACKBAR MASIH ADA (JIKA PERLU) -->
      <v-snackbar
        v-model="snackbar"
        :timeout="10000"
        :color="snackbarColor"
        elevation="24"
      >
        {{ snackbarMessage }}
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import axios from 'axios'

const rfidNumber = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const attendanceData = ref(null)
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const rfidInput = ref(null)

const currentTime = computed(() => {
  return new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const attendanceType = computed(() => {
  return attendanceData.value?.attendance?.check_out_time ? 'Pulang' : 'Masuk'
})

const statusColor = computed(() => {
  switch(attendanceData.value?.attendance?.status) {
    case 'Tepat Waktu': return 'success'
    case 'Terlambat': return 'warning'
    default: return 'primary'
  }
})

const handleRfidInput = () => {
  if (rfidNumber.value.length >= 10 && !isLoading.value) {
    handleAttendance()
  }
}

const handleAttendance = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/attendance`,
      { rfid_number: rfidNumber.value },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    )

    if (response.data.success) {
      attendanceData.value = response.data.data
      successMessage.value = response.data.message
      showSnackbar('success', response.data.message)
    } else {
      errorMessage.value = response.data.message
      showSnackbar('error', response.data.message)
    }

    setTimeout(() => {
      attendanceData.value = null
      errorMessage.value = ''
      successMessage.value = ''
    }, 10000)

  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
    rfidNumber.value = ''
    nextTick(() => rfidInput.value?.focus())
  }
}

const handleError = (error) => {
  let message = 'Terjadi kesalahan.'
  if (error.response?.data?.message) {
    message = error.response.data.message
  } else if (error.request) {
    message = 'Tidak ada respon dari server.'
  }
  errorMessage.value = message
  showSnackbar('error', message)
}

const showSnackbar = (type, message) => {
  snackbarColor.value = type
  snackbarMessage.value = message
  snackbar.value = true
}

onMounted(() => {
  nextTick(() => {
    rfidInput.value?.focus()
  })
})
</script>

<style scoped>
.v-card {
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  transition: transform 0.3s ease;
}

.v-card:hover {
  transform: translateY(-5px);
}

.v-text-field {
  font-size: 1.2rem;
  letter-spacing: 0.5px;
}

.v-alert {
  border-radius: 12px;
  font-weight: 500;
}

.v-list-item {
  padding: 6px 0;
}

.v-avatar {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>
