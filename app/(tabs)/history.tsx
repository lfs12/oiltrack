import { useCallback, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { RecordCard } from "@/components/RecordCard";
import { getRecordsByPlate, getUniquePlates, type OilChangeRecord } from "@/lib/storage";
import { useFocusEffect } from "expo-router";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<OilChangeRecord[]>([]);
  const [searched, setSearched] = useState(false);
  const [plates, setPlates] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      getUniquePlates().then(setPlates);
    }, [])
  );

  const handleSearch = async (text?: string) => {
    const query = text ?? searchText;
    if (!query.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const data = await getRecordsByPlate(query.trim());
    setResults(data);
    setSearched(true);
  };

  const handlePlatePress = (plateValue: string) => {
    setSearchText(plateValue);
    handleSearch(plateValue);
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.headerSection, { paddingTop: insets.top + webTopInset + 12 }]}>
        <Text style={styles.title}>Historial</Text>
        <Text style={styles.subtitle}>Buscar por placa del vehiculo</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.light.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar placa (ej: ABC-123)"
            placeholderTextColor={Colors.light.textSecondary}
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              if (!text.trim()) {
                setSearched(false);
                setResults([]);
              }
            }}
            onSubmitEditing={() => handleSearch()}
            autoCapitalize="characters"
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <Pressable
              onPress={() => {
                setSearchText("");
                setSearched(false);
                setResults([]);
              }}
            >
              <Ionicons name="close-circle" size={20} color={Colors.light.textSecondary} />
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={() => handleSearch()}
          style={({ pressed }) => [
            styles.searchButton,
            pressed && styles.searchButtonPressed,
          ]}
        >
          <Ionicons name="search" size={18} color={Colors.light.surface} />
          <Text style={styles.searchButtonText}>Buscar</Text>
        </Pressable>
      </View>

      {!searched && plates.length > 0 && (
        <View style={styles.platesSection}>
          <Text style={styles.platesTitle}>Placas registradas</Text>
          <View style={styles.platesGrid}>
            {plates.map((p) => (
              <Pressable
                key={p}
                onPress={() => handlePlatePress(p)}
                style={({ pressed }) => [
                  styles.plateChip,
                  pressed && styles.plateChipPressed,
                ]}
              >
                <Ionicons name="car-sport" size={14} color={Colors.darkNavy} />
                <Text style={styles.plateChipText}>{p}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {searched && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecordCard record={item} />}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            results.length > 0 ? (
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                  {results.length} {results.length === 1 ? "resultado" : "resultados"} para{" "}
                  <Text style={styles.resultsPlate}>{searchText.toUpperCase()}</Text>
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={48} color={Colors.light.textSecondary} />
              <Text style={styles.emptyTitle}>Sin resultados</Text>
              <Text style={styles.emptyText}>
                No se encontraron registros para la placa "{searchText.toUpperCase()}"
              </Text>
            </View>
          }
        />
      )}

      {!searched && plates.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={Colors.light.textSecondary} />
          <Text style={styles.emptyTitle}>Buscar historial</Text>
          <Text style={styles.emptyText}>
            Ingresa una placa para ver el historial de cambios de aceite
          </Text>
        </View>
      )}
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
    paddingBottom: 20,
    backgroundColor: Colors.light.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: Colors.light.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.darkNavy,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: Colors.light.text,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.darkNavy,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  searchButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  searchButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.light.surface,
  },
  platesSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  platesTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 12,
  },
  platesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  plateChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    shadowColor: Colors.light.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  plateChipPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  plateChipText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: Colors.darkNavy,
    letterSpacing: 0.5,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  resultsHeader: {
    paddingVertical: 12,
  },
  resultsCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  resultsPlate: {
    fontFamily: "Inter_700Bold",
    color: Colors.darkNavy,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.light.text,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
