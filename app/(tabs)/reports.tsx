import { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import Colors from "@/constants/colors";
import { getAllRecords, type OilChangeRecord } from "@/lib/storage";

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const [totalRecords, setTotalRecords] = useState(0);
  const [uniqueVehicles, setUniqueVehicles] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getAllRecords().then((records) => {
        setTotalRecords(records.length);
        const plates = new Set(records.map((r) => r.plate.toUpperCase()));
        setUniqueVehicles(plates.size);
      });
    }, [])
  );

  const exportToExcel = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExporting(true);

    try {
      const records = await getAllRecords();

      if (records.length === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setExporting(false);
        return;
      }

      const data = records.map((r) => ({
        Placa: r.plate,
        Vehiculo: r.vehicle,
        Filtro: r.filter,
        Aceite: r.oil,
        Viscosidad: r.viscosity,
        Fecha: r.date,
        Hora: r.time,
        Kilometraje: r.mileage || "-",
        "TLF Cliente": r.customerPhone || "-",
        Responsable: r.responsible,
        Notas: r.notes || "-",
      }));

      const ws = XLSX.utils.json_to_sheet(data);

      const colWidths = [
        { wch: 12 },
        { wch: 24 },
        { wch: 16 },
        { wch: 16 },
        { wch: 12 },
        { wch: 14 },
        { wch: 10 },
        { wch: 12 },
        { wch: 16 },
        { wch: 18 },
        { wch: 24 },
      ];
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Cambios de aceite");

      const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
      const uint8 = new Uint8Array(wbout);

      if (Platform.OS === "web") {
        const blob = new Blob([uint8], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "cambios_de_aceite.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        let binary = "";
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        const b64 = btoa(binary);
        const fileUri = FileSystem.cacheDirectory + "cambios_de_aceite.xlsx";
        await FileSystem.writeAsStringAsync(fileUri, b64, {
          encoding: "base64" as any,
        });
        await Sharing.shareAsync(fileUri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Exportar cambios de aceite",
          UTI: "org.openxmlformats.spreadsheetml.sheet",
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const now = new Date();
      setLastExport(
        now.toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (err) {
      console.error("Export error:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setExporting(false);
    }
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.headerSection,
          { paddingTop: insets.top + webTopInset + 12 },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Reportes</Text>
          <View style={styles.headerBadge}>
            <Ionicons name="document-text" size={24} color={Colors.amber} />
          </View>
        </View>
        <Text style={styles.subtitle}>Exporta tus registros a Excel</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="documents-outline" size={28} color={Colors.amber} />
            <Text style={styles.statNumber}>{totalRecords}</Text>
            <Text style={styles.statLabel}>Registros</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="car-sport-outline" size={28} color={Colors.slateBlue} />
            <Text style={styles.statNumber}>{uniqueVehicles}</Text>
            <Text style={styles.statLabel}>Vehiculos</Text>
          </View>
        </View>

        <View style={styles.exportCard}>
          <View style={styles.exportCardHeader}>
            <MaterialCommunityIcons
              name="file-excel-outline"
              size={32}
              color="#217346"
            />
            <View style={styles.exportCardHeaderText}>
              <Text style={styles.exportCardTitle}>Excel (.xlsx)</Text>
              <Text style={styles.exportCardDesc}>
                Todos los cambios de aceite
              </Text>
            </View>
          </View>

          <View style={styles.exportCardColumns}>
            <Text style={styles.exportCardColumnsTitle}>Columnas incluidas:</Text>
            <View style={styles.columnsGrid}>
              {[
                "Placa",
                "Vehiculo",
                "Filtro",
                "Aceite",
                "Viscosidad",
                "Fecha",
                "Hora",
                "Km",
                "TLF Cliente",
                "Responsable",
              ].map((col) => (
                <View key={col} style={styles.columnChip}>
                  <Ionicons
                    name="checkmark-circle"
                    size={12}
                    color={Colors.light.success}
                  />
                  <Text style={styles.columnChipText}>{col}</Text>
                </View>
              ))}
            </View>
          </View>

          <Pressable
            onPress={exportToExcel}
            disabled={exporting || totalRecords === 0}
            style={({ pressed }) => [
              styles.exportButton,
              pressed && styles.exportButtonPressed,
              (exporting || totalRecords === 0) && styles.exportButtonDisabled,
            ]}
          >
            {exporting ? (
              <ActivityIndicator size="small" color={Colors.light.surface} />
            ) : (
              <Ionicons name="download-outline" size={22} color={Colors.light.surface} />
            )}
            <Text style={styles.exportButtonText}>
              {exporting
                ? "Exportando..."
                : totalRecords === 0
                  ? "Sin registros para exportar"
                  : "Descargar Excel"}
            </Text>
          </Pressable>

          {lastExport && (
            <View style={styles.lastExportRow}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={Colors.light.success}
              />
              <Text style={styles.lastExportText}>
                Exportado: {lastExport}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.light.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: Colors.light.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.darkNavy,
  },
  headerBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(229, 161, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  body: {
    padding: 20,
    gap: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    gap: 6,
    shadowColor: Colors.light.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.darkNavy,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  exportCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.light.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  exportCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },
  exportCardHeaderText: {
    flex: 1,
  },
  exportCardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.darkNavy,
  },
  exportCardDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  exportCardColumns: {
    marginBottom: 18,
  },
  exportCardColumnsTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 10,
  },
  columnsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  columnChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  columnChipText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.light.text,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#217346",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#217346",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exportButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  exportButtonDisabled: {
    opacity: 0.5,
  },
  exportButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.light.surface,
  },
  lastExportRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  lastExportText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
});
