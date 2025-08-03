import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { DeliveryStatus } from "@/types";

interface StatusStepperProps {
  currentStatus: DeliveryStatus;
  compact?: boolean;
}

export const StatusStepper: React.FC<StatusStepperProps> = ({ currentStatus, compact = false }) => {
  const statuses: DeliveryStatus[] = [
    "pending",
    "accepted",
    "picked_up",
    "in_transit",
    "delivered",
  ];

  const getStatusIndex = (status: DeliveryStatus): number => {
    if (status === "cancelled") return -1;
    return statuses.indexOf(status);
  };

  const currentIndex = getStatusIndex(currentStatus);

  const formatStatus = (status: string): string => {
    return status.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  if (currentStatus === "cancelled") {
    return (
      <View style={[styles.cancelledContainer, compact && styles.compactCancelled]}>
        <Text style={[styles.cancelledText, compact && styles.compactCancelledText]}>
          {compact ? 'Cancelled' : 'This delivery has been cancelled'}
        </Text>
      </View>
    );
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactStatus}>
          {formatStatus(currentStatus)}
        </Text>
        <View style={styles.compactProgress}>
          <View 
            style={[
              styles.compactProgressBar,
              { width: `${((currentIndex + 1) / statuses.length) * 100}%` }
            ]} 
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {statuses.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const isActive = index === currentIndex;

        return (
          <React.Fragment key={status}>
            {index > 0 && (
              <View 
                style={[
                  styles.connector, 
                  isCompleted ? styles.activeConnector : {}
                ]} 
              />
            )}
            <View 
              style={[
                styles.step,
                isActive ? styles.activeStep : {},
                isCompleted ? styles.completedStep : {},
              ]}
            >
              {isCompleted ? (
                <Check size={16} color={Colors.background} />
              ) : (
                <Text style={styles.stepNumber}>{index + 1}</Text>
              )}
            </View>
          </React.Fragment>
        );
      })}

      <View style={styles.labelsContainer}>
        {statuses.map((status, index) => (
          <View key={`label-${status}`} style={styles.labelContainer}>
            <Text 
              style={[
                styles.label,
                index <= currentIndex ? styles.activeLabel : {},
              ]}
              numberOfLines={1}
            >
              {formatStatus(status)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 24,
    position: "relative",
    paddingBottom: 24,
  },
  step: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  activeStep: {
    borderColor: Colors.primary,
  },
  completedStep: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textLight,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    zIndex: 0,
  },
  activeConnector: {
    backgroundColor: Colors.primary,
  },
  labelsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  labelContainer: {
    width: 56,
    alignItems: "center",
    marginHorizontal: -14,
  },
  label: {
    fontSize: 10,
    textAlign: "center",
    color: Colors.textLight,
  },
  activeLabel: {
    color: Colors.text,
    fontWeight: "500",
  },
  cancelledContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: Colors.error + "20", // 20% opacity
    borderRadius: 8,
    marginVertical: 16,
  },
  cancelledText: {
    color: Colors.error,
    fontWeight: "500",
  },
  compactContainer: {
    marginVertical: 8,
  },
  compactStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  compactProgress: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  compactCancelled: {
    marginVertical: 8,
    padding: 8,
  },
  compactCancelledText: {
    fontSize: 14,
  },
});