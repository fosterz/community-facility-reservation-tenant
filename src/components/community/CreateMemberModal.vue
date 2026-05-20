<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { api } from '@/lib/api'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

interface Wing { id: string; name: string }
interface Building { id: string; name: string; totalFloors: number; wings: Wing[] }

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; created: [] }>()

const buildings = ref<Building[]>([])
const loading = ref(false)
const error = ref('')

const form = reactive({
  firstName: '',
  lastName: '',
  mobile: '',
  email: '',
  password: '',
  ownershipType: 'owner',
  buildingId: '',
  wingId: '',
  floor: '',
  flatNumber: '',
})

const buildingOptions = computed(() => [
  { value: '', label: '— No building (open plot / standalone) —' },
  ...buildings.value.map(b => ({ value: b.id, label: b.name })),
])

const selectedBuilding = computed(() =>
  buildings.value.find(b => b.id === form.buildingId) ?? null
)

const wingOptions = computed(() => {
  const b = selectedBuilding.value
  if (!b || b.wings.length === 0) return []
  return [
    { value: '', label: '— No specific wing —' },
    ...b.wings.map(w => ({ value: w.id, label: w.name })),
  ]
})

const floorOptions = computed(() => {
  const b = selectedBuilding.value
  if (!b) return []
  return [
    { value: '', label: '— Select floor —' },
    ...Array.from({ length: b.totalFloors }, (_, i) => ({
      value: String(i + 1),
      label: `Floor ${i + 1}`,
    })),
  ]
})

watch(() => form.buildingId, () => {
  form.wingId = ''
  form.floor = ''
})

const ownershipOptions = [
  { value: 'owner', label: 'Owner' },
  { value: 'tenant', label: 'Tenant / Renter' },
]

onMounted(async () => {
  try {
    const { data } = await api.get('/community/buildings')
    buildings.value = data.data ?? []
  } catch {
    // buildings optional — member can still be added without building structure
  }
})

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const building = selectedBuilding.value
    const wing = building?.wings.find(w => w.id === form.wingId) ?? null

    await api.post('/community/members', {
      firstName: form.firstName,
      lastName: form.lastName,
      mobile: form.mobile,
      email: form.email || undefined,
      initialPassword: form.password,
      ownershipType: form.ownershipType,
      buildingId: building?.id || undefined,
      buildingName: building?.name || undefined,
      wingId: wing?.id || undefined,
      wingName: wing?.name || undefined,
      floor: form.floor ? parseInt(form.floor) : undefined,
      flatNumber: form.flatNumber,
    })
    emit('created')
    emit('close')
    Object.assign(form, {
      firstName: '', lastName: '', mobile: '', email: '', password: '',
      ownershipType: 'owner', buildingId: '', wingId: '', floor: '', flatNumber: '',
    })
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    error.value = e.response?.data?.message ?? 'Failed to create member.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal :open="open" title="Add New Member" size="lg" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <!-- Name -->
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="form.firstName" label="First Name *" placeholder="Aditya" />
        <BaseInput v-model="form.lastName" label="Last Name *" placeholder="Sharma" />
      </div>

      <!-- Contact -->
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="form.mobile" label="Mobile *" placeholder="9876543210" />
        <BaseInput v-model="form.email" label="Email (optional)" type="email" placeholder="member@email.com" />
      </div>

      <!-- Unit -->
      <div>
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Unit Assignment</p>
        <div class="space-y-3">
          <!-- Building -->
          <BaseSelect v-model="form.buildingId" label="Building / Tower" :options="buildingOptions" />

          <!-- Wing (only if building has wings) -->
          <BaseSelect
            v-if="wingOptions.length > 0"
            v-model="form.wingId"
            label="Wing"
            :options="wingOptions"
          />

          <!-- Floor (only if building selected) -->
          <BaseSelect
            v-if="selectedBuilding"
            v-model="form.floor"
            label="Floor"
            :options="floorOptions"
          />

          <!-- Flat number always required -->
          <BaseInput
            v-model="form.flatNumber"
            label="Flat / Unit Number *"
            :placeholder="selectedBuilding ? '101' : 'e.g. A-102 or Villa 5'"
          />
        </div>
      </div>

      <!-- Ownership -->
      <BaseSelect v-model="form.ownershipType" label="Ownership Type" :options="ownershipOptions" />

      <!-- Password -->
      <BaseInput v-model="form.password" label="Temporary Password *" type="password" placeholder="Min 8 characters" />
      <p class="text-xs text-slate-400 -mt-2">Member will be prompted to change password on first login.</p>

      <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
        {{ error }}
      </div>
    </form>
    <template #footer>
      <BaseButton variant="secondary" @click="emit('close')">Cancel</BaseButton>
      <BaseButton :loading="loading" @click="submit">Add Member</BaseButton>
    </template>
  </BaseModal>
</template>
