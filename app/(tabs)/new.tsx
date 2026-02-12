import { useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { FormInput } from "@/components/FormInput";
import {
  addRecord,
  getVehicleProfiles,
  type VehicleProfile,
} from "@/lib/storage";

// --- LISTAS DE DATOS ---
const COMMON_OILS = [
  "Mobil 1",
  "Castrol",
  "Shell Helix",
  "Motul",
  "Valvoline",
  "Total",
  "Inca",
];
const COMMON_VISCOSITIES = [
  "0W-20",
  "5W-20",
  "5W-30",
  "5W-40",
  "10W-30",
  "10W-40",
  "15W-40",
  "20W-50",
];
const COMMON_FILTERS = [
  "WIX",
  "Premium Guard",
  "Fram",
  "Mann Filter",
  "Bosch",
  "Millard",
];

export default function NewRecordScreen() {
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([]);
  const [selectedPlate, setSelectedPlate] = useState<string | null>(null);

  const [plate, setPlate] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [filter, setFilter] = useState("");
  const [oil, setOil] = useState("");
  const [viscosity, setViscosity] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [responsible, setResponsible] = useState("");
  const [mileage, setMileage] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- REFS PARA SALTOS (Casting a any para evitar el error de IntrinsicAttributes) ---
  const viscosityRef = useRef<any>(null);
  const filterRef = useRef<any>(null);
  const phoneRef = useRef<any>(null);
  const responsibleRef = useRef<any>(null);

  useFocusEffect(
    useCallback(() => {
      getVehicleProfiles().then(setVehicles);
    }, []),
  );

  // ... (fillFromVehicle y clearSelection se mantienen igual)
  const fillFromVehicle = (vp: VehicleProfile) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPlate(vp.plate);
    setPlate(vp.plate);
    setVehicle(vp.vehicle);
    setCustomerPhone(vp.customerPhone);
    setOil(vp.oil);
    setViscosity(vp.viscosity);
    setFilter(vp.filter);
    setErrors({});
  };

  const clearSelection = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlate(null);
    setPlate("");
    setVehicle("");
    setCustomerPhone("");
    setOil("");
    setViscosity("");
    setFilter("");
    setResponsible("");
    setMileage("");
    setNotes("");
    setErrors({});
  };

  // --- COMPONENTE INTERNO DE SUGERENCIAS ---
  const RenderSuggestions = ({
    value,
    list,
    onSelect,
  }: {
    value: string;
    list: string[];
    onSelect: (val: string) => void;
  }) => {
    if (!value || list.includes(value)) return null;
    const filtered = list
      .filter((i) => i.toLowerCase().startsWith(value.toLowerCase()))
      .slice(0, 3);
    if (filtered.length === 0) return null;

    return (
      <View style={styles.suggestionRow}>
        {filtered.map((item) => (
          <Pressable
            key={item}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(item);
            }}
            style={styles.suggestionBadge}
          >
            <Text style={styles.suggestionBadgeText}>{item}</Text>
          </Pressable>
        ))}
      </View>
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!plate.trim()) newErrors.plate = "La placa es obligatoria";
    if (!vehicle.trim()) newErrors.vehicle = "El vehiculo es obligatorio";
    if (!filter.trim()) newErrors.filter = "El filtro es obligatorio";
    if (!oil.trim()) newErrors.oil = "El aceite es obligatorio";
    if (!viscosity.trim()) newErrors.viscosity = "La viscosidad es obligatoria";
    if (
      customerPhone.trim() &&
      !/^\d{10,15}$/.test(customerPhone.trim()) &&
      customerPhone.length === 11
    )
      newErrors.viscosity = "El telefono debe tener entre 10 y 15 digitos";
    if (!responsible.trim())
      newErrors.responsible = "El responsable es obligatorio";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setSaving(true);
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const timeStr = now.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      await addRecord({
        plate: plate.trim().toUpperCase(),
        vehicle: vehicle.trim(),
        filter: filter.trim(),
        oil: oil.trim(),
        viscosity: viscosity.trim(),
        customerPhone: customerPhone.trim(),
        responsible: responsible.trim(),
        date: dateStr,
        time: timeStr,
        mileage: mileage.trim(),
        notes: notes.trim(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Guardado", "Cambio de aceite registrado exitosamente", [
        {
          text: "OK",
          onPress: () => {
            clearSelection();
            router.navigate("/(tabs)");
          },
        },
      ]);
    } catch {
      Alert.alert("Error", "No se pudo guardar el registro");
    } finally {
      setSaving(false);
    }
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + webTopInset + 12,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Nuevo Registro</Text>
          <View style={styles.headerBadge}>
            <MaterialCommunityIcons name="oil" size={20} color={Colors.amber} />
          </View>
        </View>
        <Text style={styles.subtitle}>Registra un cambio de aceite</Text>

        {/* ... (Sección de vehículos registrados se mantiene igual) ... */}
        {vehicles.length > 0 && !selectedPlate && (
          <View style={styles.vehiclesSection}>
            <View style={styles.vehiclesSectionHeader}>
              <Ionicons name="car-sport" size={18} color={Colors.slateBlue} />
              <Text style={styles.vehiclesSectionTitle}>
                Vehiculos registrados
              </Text>
            </View>
            <Text style={styles.vehiclesSectionHint}>
              Selecciona un vehiculo para auto-completar los datos
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.vehiclesScroll}
            >
              {vehicles.map((vp) => (
                <Pressable
                  key={vp.plate}
                  onPress={() => fillFromVehicle(vp)}
                  style={({ pressed }) => [
                    styles.vehicleCard,
                    pressed && styles.vehicleCardPressed,
                  ]}
                >
                  <View style={styles.vehicleCardPlate}>
                    <Ionicons
                      name="car-sport"
                      size={14}
                      color={Colors.light.surface}
                    />
                    <Text style={styles.vehicleCardPlateText}>{vp.plate}</Text>
                  </View>
                  <Text style={styles.vehicleCardName} numberOfLines={1}>
                    {vp.vehicle}
                  </Text>
                  <View style={styles.vehicleCardMeta}>
                    <Ionicons
                      name="build-outline"
                      size={12}
                      color={Colors.light.textSecondary}
                    />
                    <Text style={styles.vehicleCardMetaText}>
                      {vp.totalServices}{" "}
                      {vp.totalServices === 1 ? "servicio" : "servicios"}
                    </Text>
                  </View>
                  <Text style={styles.vehicleCardDate}>{vp.lastDate}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {selectedPlate && (
          <View style={styles.selectedBanner}>
            <View style={styles.selectedBannerLeft}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.light.success}
              />
              <Text style={styles.selectedBannerText}>
                Datos cargados de{" "}
                <Text style={styles.selectedBannerPlate}>{selectedPlate}</Text>
              </Text>
            </View>
            <Pressable
              onPress={clearSelection}
              style={styles.selectedBannerClear}
            >
              <Ionicons name="close" size={18} color={Colors.light.danger} />
            </Pressable>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehiculo</Text>
          <FormInput
            label="Placa"
            placeholder="ABC-123"
            value={plate}
            onChangeText={(text) => {
              setPlate(text);
              if (selectedPlate) setSelectedPlate(null);
            }}
            autoCapitalize="characters"
            error={errors.plate}
            icon={
              <Ionicons
                name="car-sport"
                size={20}
                color={Colors.light.textSecondary}
              />
            }
          />
          <FormInput
            label="Vehiculo"
            placeholder="Toyota Corolla 2022"
            value={vehicle}
            onChangeText={setVehicle}
            error={errors.vehicle}
            icon={
              <Ionicons
                name="car"
                size={20}
                color={Colors.light.textSecondary}
              />
            }
          />
          <FormInput
            label="Kilometraje"
            placeholder="45000"
            value={mileage}
            onChangeText={setMileage}
            keyboardType="numeric"
            icon={
              <Ionicons
                name="speedometer-outline"
                size={20}
                color={Colors.light.textSecondary}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aceite y Filtro</Text>

          <FormInput
            label="Aceite"
            placeholder="Mobil 1"
            value={oil}
            onChangeText={setOil}
            error={errors.oil}
            icon={
              <MaterialCommunityIcons
                name="oil"
                size={20}
                color={Colors.light.textSecondary}
              />
            }
          />
          <RenderSuggestions
            value={oil}
            list={COMMON_OILS}
            onSelect={(val) => {
              setOil(val);
              viscosityRef.current?.focus();
            }}
          />

          <FormInput
            // @ts-ignore - Bypass temporal para evitar alterar el componente FormInput
            ref={viscosityRef}
            label="Viscosidad"
            placeholder="5W-30"
            value={viscosity}
            onChangeText={setViscosity}
            error={errors.viscosity}
            icon={
              <Ionicons
                name="water-outline"
                size={20}
                color={Colors.light.textSecondary}
              />
            }
          />
          <RenderSuggestions
            value={viscosity}
            list={COMMON_VISCOSITIES}
            onSelect={(val) => {
              setViscosity(val);
              filterRef.current?.focus();
            }}
          />

          <FormInput
            // @ts-ignore
            ref={filterRef}
            label="Filtro"
            placeholder="WIX 51348"
            value={filter}
            onChangeText={setFilter}
            error={errors.filter}
            icon={
              <MaterialCommunityIcons
                name="filter"
                size={20}
                color={Colors.light.textSecondary}
              />
            }
          />
          <RenderSuggestions
            value={filter}
            list={COMMON_FILTERS}
            onSelect={(val) => {
              setFilter(val);
              phoneRef.current?.focus();
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacto</Text>
          <FormInput
            // @ts-ignore
            ref={phoneRef}
            label="Telefono del Cliente"
            placeholder="Ej. 04240000000"
            value={customerPhone}
            onChangeText={(text) => {
              setCustomerPhone(text);
              // Limpiamos el texto de caracteres no numéricos
              const cleaned = text.replace(/[^0-9]/g, "");

              // Si alcanza los 11 dígitos (ajusta este número según tu país)
              if (cleaned.length === 11) {
                Haptics.selectionAsync(); // Feedback táctil de que terminó
                responsibleRef.current?.focus(); // Salto automático
              }
            }}
            //onChangeText={setCustomerPhone}
            keyboardType="phone-pad"
            icon={
              <Ionicons
                name="call-outline"
                size={20}
                color={Colors.light.textSecondary}
              />
            }
          />
          <FormInput
            // @ts-ignore
            ref={responsibleRef}
            label="Responsable"
            placeholder="Juan Perez"
            value={responsible}
            onChangeText={setResponsible}
            error={errors.responsible}
            icon={
              <Ionicons
                name="person-outline"
                size={20}
                color={Colors.light.textSecondary}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <FormInput
            label="Notas (Opcional)"
            placeholder="Observaciones adicionales..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.notesInput}
            icon={
              <Ionicons
                name="document-text-outline"
                size={20}
                color={Colors.light.textSecondary}
              />
            }
          />
        </View>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
            saving && styles.saveButtonDisabled,
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={22}
            color={Colors.light.surface}
          />
          <Text style={styles.saveButtonText}>
            {saving ? "Guardando..." : "Guardar Registro"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ... (Tus estilos existentes se mantienen)
  container: { flex: 1, backgroundColor: Colors.light.background },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, color: Colors.darkNavy },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(229, 161, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 20,
    marginTop: 4,
  },
  vehiclesSection: {
    marginBottom: 24,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  vehiclesSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  vehiclesSectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: Colors.slateBlue,
  },
  vehiclesSectionHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 14,
  },
  vehiclesScroll: { gap: 10, paddingRight: 4 },
  vehicleCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 14,
    padding: 14,
    width: 160,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  vehicleCardPressed: {
    borderColor: Colors.amber,
    backgroundColor: "rgba(229, 161, 0, 0.05)",
    transform: [{ scale: 0.97 }],
  },
  vehicleCardPlate: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.darkNavy,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    gap: 5,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  vehicleCardPlateText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: Colors.light.surface,
    letterSpacing: 0.8,
  },
  vehicleCardName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 6,
  },
  vehicleCardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  vehicleCardMetaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  vehicleCardDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  selectedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(46, 204, 113, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(46, 204, 113, 0.3)",
  },
  selectedBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  selectedBannerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.light.text,
  },
  selectedBannerPlate: { fontFamily: "Inter_700Bold", color: Colors.darkNavy },
  selectedBannerClear: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  section: { marginBottom: 8 },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.slateBlue,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: Colors.amber,
    alignSelf: "flex-start",
  },
  notesInput: { minHeight: 80, textAlignVertical: "top" as const },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.darkNavy,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  saveButtonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.light.surface,
  },

  // --- NUEVOS ESTILOS PARA SUGERENCIAS ---
  suggestionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: -8,
    marginBottom: 16,
  },
  suggestionBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  suggestionBadgeText: {
    fontSize: 12,
    color: Colors.darkNavy,
    fontFamily: "Inter_600SemiBold",
  },
});
