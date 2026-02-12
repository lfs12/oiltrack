import AsyncStorage from "@react-native-async-storage/async-storage";

export interface OilChangeRecord {
  id: string;
  plate: string;
  vehicle: string;
  filter: string;
  oil: string;
  viscosity: string;
  customerPhone: string;
  responsible: string;
  date: string;
  time: string;
  mileage: string;
  notes: string;
}

const STORAGE_KEY = "oil_change_records";

export async function getAllRecords(): Promise<OilChangeRecord[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data) as OilChangeRecord[];
}

export async function addRecord(record: Omit<OilChangeRecord, "id">): Promise<OilChangeRecord> {
  const records = await getAllRecords();
  const newRecord: OilChangeRecord = {
    ...record,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  };
  records.unshift(newRecord);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return newRecord;
}

export async function getRecordsByPlate(plate: string): Promise<OilChangeRecord[]> {
  const records = await getAllRecords();
  return records.filter(
    (r) => r.plate.toLowerCase().replace(/[\s-]/g, "") === plate.toLowerCase().replace(/[\s-]/g, "")
  );
}

export async function deleteRecord(id: string): Promise<void> {
  const records = await getAllRecords();
  const filtered = records.filter((r) => r.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export async function getUniquePlates(): Promise<string[]> {
  const records = await getAllRecords();
  const plates = new Set(records.map((r) => r.plate.toUpperCase()));
  return Array.from(plates);
}

export interface VehicleProfile {
  plate: string;
  vehicle: string;
  customerPhone: string;
  oil: string;
  viscosity: string;
  filter: string;
  lastMileage: string;
  lastDate: string;
  totalServices: number;
}

export async function getVehicleProfiles(): Promise<VehicleProfile[]> {
  const records = await getAllRecords();
  const map = new Map<string, VehicleProfile>();
  for (const r of records) {
    const key = r.plate.toUpperCase().replace(/[\s-]/g, "");
    if (!map.has(key)) {
      map.set(key, {
        plate: r.plate.toUpperCase(),
        vehicle: r.vehicle,
        customerPhone: r.customerPhone,
        oil: r.oil,
        viscosity: r.viscosity,
        filter: r.filter,
        lastMileage: r.mileage,
        lastDate: r.date,
        totalServices: 1,
      });
    } else {
      const existing = map.get(key)!;
      existing.totalServices += 1;
    }
  }
  return Array.from(map.values());
}

export async function getLatestByPlate(plate: string): Promise<OilChangeRecord | null> {
  const records = await getAllRecords();
  const match = records.find(
    (r) => r.plate.toUpperCase().replace(/[\s-]/g, "") === plate.toUpperCase().replace(/[\s-]/g, "")
  );
  return match ?? null;
}
