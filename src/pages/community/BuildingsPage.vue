<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

interface Wing { id: string; name: string }
interface Building { id: string; name: string; description?: string; totalFloors: number; wings: Wing[]; createdAt: string }

const buildings = ref<Building[]>([])
const loading = ref(true)

// Building modal
const showBuildingModal = ref(false)
const savingBuilding = ref(false)
const buildingError = ref('')
const editingBuilding = ref<Building | null>(null)
const buildingForm = ref({ name: '', description: '', totalFloors: 1 })

// Wing modal
const showWingModal = ref(false)
const savingWing = ref(false)
const wingError = ref('')
const editingWing = ref<Wing | null>(null)
const activeBuilding = ref<Building | null>(null)
const wingName = ref('')

async function fetchBuildings() {
  loading.value = true
  try {
    const { data } = await api.get('/community/buildings')
    buildings.value = data.data ?? []
  } finally {
    loading.value = false
  }
}

onMounted(fetchBuildings)

function openCreateBuilding() {
  editingBuilding.value = null
  buildingForm.value = { name: '', description: '', totalFloors: 1 }
  buildingError.value = ''
  showBuildingModal.value = true
}

function openEditBuilding(b: Building) {
  editingBuilding.value = b
  buildingForm.value = { name: b.name, description: b.description ?? '', totalFloors: b.totalFloors }
  buildingError.value = ''
  showBuildingModal.value = true
}

async function saveBuilding() {
  savingBuilding.value = true
  buildingError.value = ''
  try {
    if (editingBuilding.value) {
      await api.put(`/community/buildings/${editingBuilding.value.id}`, buildingForm.value)
    } else {
      await api.post('/community/buildings', buildingForm.value)
    }
    showBuildingModal.value = false
    fetchBuildings()
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    buildingError.value = e.response?.data?.message ?? 'Failed to save.'
  } finally {
    savingBuilding.value = false
  }
}

async function deleteBuilding(b: Building) {
  if (!confirm(`Delete "${b.name}"? This cannot be undone.`)) return
  await api.delete(`/community/buildings/${b.id}`)
  fetchBuildings()
}

function openAddWing(b: Building) {
  activeBuilding.value = b
  editingWing.value = null
  wingName.value = ''
  wingError.value = ''
  showWingModal.value = true
}

function openEditWing(b: Building, w: Wing) {
  activeBuilding.value = b
  editingWing.value = w
  wingName.value = w.name
  wingError.value = ''
  showWingModal.value = true
}

async function saveWing() {
  if (!activeBuilding.value || !wingName.value.trim()) return
  savingWing.value = true
  wingError.value = ''
  try {
    if (editingWing.value) {
      await api.put(`/community/buildings/${activeBuilding.value.id}/wings/${editingWing.value.id}`, { name: wingName.value })
    } else {
      await api.post(`/community/buildings/${activeBuilding.value.id}/wings`, { name: wingName.value })
    }
    showWingModal.value = false
    fetchBuildings()
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    wingError.value = e.response?.data?.message ?? 'Failed to save.'
  } finally {
    savingWing.value = false
  }
}

async function deleteWing(b: Building, w: Wing) {
  if (!confirm(`Remove wing "${w.name}" from "${b.name}"?`)) return
  await api.delete(`/community/buildings/${b.id}/wings/${w.id}`)
  fetchBuildings()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Buildings & Wings</h1>
        <p class="text-sm text-slate-500 mt-0.5">Define towers, blocks, and wings for member unit assignment</p>
      </div>
      <BaseButton @click="openCreateBuilding">+ Add Building</BaseButton>
    </div>

    <div v-if="loading" class="text-slate-400 text-sm">Loading...</div>

    <div v-else-if="buildings.length === 0" class="text-center py-16 bg-white rounded-xl border border-slate-200">
      <p class="text-slate-400 text-sm">No buildings defined yet.</p>
      <p class="text-slate-400 text-xs mt-1">Add towers or blocks to organize member unit assignments.</p>
      <BaseButton class="mt-4" @click="openCreateBuilding">+ Add First Building</BaseButton>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="building in buildings"
        :key="building.id"
        class="bg-white rounded-xl border border-slate-200 overflow-hidden"
      >
        <!-- Building header -->
        <div class="flex items-start justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-slate-900">{{ building.name }}</h3>
              <span class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {{ building.totalFloors }} floor{{ building.totalFloors !== 1 ? 's' : '' }}
              </span>
            </div>
            <p v-if="building.description" class="text-xs text-slate-500 mt-0.5">{{ building.description }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="text-sm text-indigo-600 hover:text-indigo-800 font-medium" @click="openAddWing(building)">
              + Wing
            </button>
            <span class="text-slate-200">|</span>
            <button class="text-sm text-slate-500 hover:text-slate-800 font-medium" @click="openEditBuilding(building)">
              Edit
            </button>
            <span class="text-slate-200">|</span>
            <button class="text-sm text-red-500 hover:text-red-700 font-medium" @click="deleteBuilding(building)">
              Delete
            </button>
          </div>
        </div>

        <!-- Wings -->
        <div class="px-6 py-3">
          <div v-if="building.wings.length === 0" class="text-xs text-slate-400 py-2">
            No wings defined — members will be assigned directly to a flat number.
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <div
              v-for="wing in building.wings"
              :key="wing.id"
              class="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5"
            >
              <span class="text-sm text-slate-700 font-medium">{{ wing.name }}</span>
              <div class="flex items-center gap-1.5">
                <button
                  class="text-xs text-indigo-500 hover:text-indigo-700"
                  @click="openEditWing(building, wing)"
                >Edit</button>
                <button
                  class="text-xs text-red-400 hover:text-red-600"
                  @click="deleteWing(building, wing)"
                >✕</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Building Modal -->
    <BaseModal
      :open="showBuildingModal"
      :title="editingBuilding ? 'Edit Building' : 'Add Building'"
      @close="showBuildingModal = false"
    >
      <form class="space-y-4" @submit.prevent="saveBuilding">
        <BaseInput v-model="buildingForm.name" label="Building / Tower Name *" placeholder="e.g. Tower A, Block 1, East Block" />
        <BaseInput v-model="buildingForm.description" label="Description (optional)" placeholder="e.g. Premium tower facing garden" />
        <BaseInput v-model.number="buildingForm.totalFloors" label="Total Floors *" type="number" />
        <div v-if="buildingError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {{ buildingError }}
        </div>
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="showBuildingModal = false">Cancel</BaseButton>
        <BaseButton :loading="savingBuilding" @click="saveBuilding">
          {{ editingBuilding ? 'Save Changes' : 'Add Building' }}
        </BaseButton>
      </template>
    </BaseModal>

    <!-- Wing Modal -->
    <BaseModal
      :open="showWingModal"
      :title="editingWing ? `Edit Wing — ${activeBuilding?.name}` : `Add Wing — ${activeBuilding?.name}`"
      size="sm"
      @close="showWingModal = false"
    >
      <form class="space-y-4" @submit.prevent="saveWing">
        <BaseInput v-model="wingName" label="Wing Name *" placeholder="e.g. Wing A, East Wing, Wing 1" />
        <div v-if="wingError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {{ wingError }}
        </div>
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="showWingModal = false">Cancel</BaseButton>
        <BaseButton :loading="savingWing" @click="saveWing">
          {{ editingWing ? 'Save' : 'Add Wing' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
