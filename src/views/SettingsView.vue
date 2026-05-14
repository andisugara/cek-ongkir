<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchSettings, updateSetting } from "../lib/supabase";
import type { SettingRecord } from "../lib/types";

const settings = ref<SettingRecord[]>([]);
const isLoading = ref(false);
const isSaving = ref(false);
const statusMessage = ref("");

async function loadSettings() {
  isLoading.value = true;
  statusMessage.value = "";

  try {
    settings.value = await fetchSettings();
  } catch (error) {
    console.error(error);
    statusMessage.value = "Gagal memuat settings.";
  } finally {
    isLoading.value = false;
  }
}

async function saveSetting(setting: SettingRecord) {
  isSaving.value = true;
  statusMessage.value = "";

  try {
    const updated = await updateSetting(setting.id, {
      key: setting.key,
      value: setting.value,
    });
    const nextSetting = updated?.[0];
    if (nextSetting) {
      settings.value = settings.value.map((row) =>
        row.id === nextSetting.id ? nextSetting : row,
      );
    }
    statusMessage.value = `Setting ${setting.key} berhasil disimpan.`;
  } catch (error) {
    console.error(error);
    statusMessage.value = `Gagal menyimpan setting ${setting.key}.`;
  } finally {
    isSaving.value = false;
  }
}

onMounted(loadSettings);
</script>

<template>
  <main class="page card">
    <div class="header">
      <div>
        <p class="eyebrow">Configuration</p>
        <h2>Setting Edit Only</h2>
        <p class="hint">
          Key dikunci. Yang bisa diubah hanya value agar referensi origin dan
          COD tetap aman.
        </p>
      </div>
      <button
        type="button"
        class="btn secondary"
        :disabled="isLoading"
        @click="loadSettings"
      >
        {{ isLoading ? "Memuat..." : "Reload" }}
      </button>
    </div>

    <p class="status">{{ statusMessage }}</p>

    <div class="table">
      <div class="table-head">
        <span>Key</span>
        <span>Value</span>
        <span>Keterangan</span>
      </div>

      <div v-for="setting in settings" :key="setting.id" class="table-row">
        <input v-model="setting.key" type="text" readonly />
        <input v-model="setting.value" type="text" />
        <div class="table-actions">
          <button
            type="button"
            class="btn secondary"
            :disabled="isSaving"
            @click="saveSetting(setting)"
          >
            Simpan
          </button>
          <small class="tag readonly">Referensi</small>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 20px;
  padding: 18px;
}

.header,
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.eyebrow {
  margin: 0 0 4px;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c2410c;
}

h2 {
  margin: 0;
}

.hint {
  margin: 6px 0 0;
  color: #64748b;
}

.grid {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

input,
button {
  font: inherit;
}

input {
  border: 1px solid #d7dce5;
  border-radius: 14px;
  padding: 11px 13px;
}

.btn {
  border: none;
  border-radius: 14px;
  padding: 11px 16px;
  background: linear-gradient(135deg, #ea580c, #c2410c);
  color: white;
  cursor: pointer;
}

.btn.secondary {
  background: #334155;
}

.btn.danger {
  background: #dc2626;
}

.table {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 220px;
  gap: 10px;
}

.table-head {
  font-weight: 700;
  color: #475569;
}

.table-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 999px;
  background: #ecfeff;
  color: #155e75;
  font-size: 12px;
  white-space: nowrap;
}

.tag.readonly {
  background: #f1f5f9;
  color: #475569;
}

.status {
  margin: 0;
  color: #475569;
}

@media (max-width: 840px) {
  .header,
  .actions,
  .table-head,
  .table-row {
    grid-template-columns: 1fr;
    display: grid;
  }

  .table-actions {
    flex-direction: column;
  }

  .two-col {
    grid-template-columns: 1fr;
  }
}
</style>
