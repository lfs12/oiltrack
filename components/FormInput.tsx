import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TextInputProps,
} from "react-native";
import Colors from "@/constants/colors";

interface FormInputProps extends TextInputProps {
  label: string;
  icon?: React.ReactNode;
  error?: string;
}

export function FormInput({
  label,
  icon,
  error,
  style,
  ...props
}: FormInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {/* Corrección: Se usa el ternario para asegurar que sea el estilo o null */}
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          // Corrección: icon && styles.inputWithIcon se cambia por ternario
          style={[styles.input, icon ? styles.inputWithIcon : null, style]}
          placeholderTextColor={Colors.light.textSecondary}
          {...props}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.light.text,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  inputError: {
    borderColor: Colors.light.danger,
  },
  iconContainer: {
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: Colors.light.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  inputWithIcon: {
    paddingLeft: 10,
  },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.light.danger,
    marginTop: 4,
  },
});
