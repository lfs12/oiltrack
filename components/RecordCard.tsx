import { StyleSheet, View, Text, Pressable } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import type { OilChangeRecord } from "@/lib/storage";

interface RecordCardProps {
  record: OilChangeRecord;
  onPress?: () => void;
  compact?: boolean;
}

export function RecordCard({ record, onPress, compact }: RecordCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.plateBadge}>
          <Ionicons name="car-sport" size={16} color={Colors.light.surface} />
          <Text style={styles.plateText}>{record.plate.toUpperCase()}</Text>
        </View>
        <Text style={styles.dateText}>{record.date}</Text>
      </View>

      <Text style={styles.vehicleName}>{record.vehicle}</Text>

      {!compact && (
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="oil" size={16} color={Colors.light.textSecondary} />
            <Text style={styles.detailLabel}>Aceite</Text>
            <Text style={styles.detailValue}>{record.oil}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="filter" size={16} color={Colors.light.textSecondary} />
            <Text style={styles.detailLabel}>Filtro</Text>
            <Text style={styles.detailValue}>{record.filter}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="speedometer-outline" size={16} color={Colors.light.textSecondary} />
            <Text style={styles.detailLabel}>Viscosidad</Text>
            <Text style={styles.detailValue}>{record.viscosity}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color={Colors.light.textSecondary} />
            <Text style={styles.detailLabel}>Hora</Text>
            <Text style={styles.detailValue}>{record.time}</Text>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="person-outline" size={14} color={Colors.light.textSecondary} />
          <Text style={styles.footerText}>{record.responsible}</Text>
        </View>
        {record.mileage ? (
          <View style={styles.footerItem}>
            <Ionicons name="speedometer-outline" size={14} color={Colors.light.textSecondary} />
            <Text style={styles.footerText}>{record.mileage} km</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.light.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  plateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.darkNavy,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  plateText: {
    color: Colors.light.surface,
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    letterSpacing: 1,
  },
  dateText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  vehicleName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: Colors.light.text,
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  detailLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  detailValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.light.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 10,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
});
