import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Star } from "lucide-react-native";
import { Colors } from "@/constants/colors";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
  showLabel?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 24,
  editable = false,
  onRatingChange,
  showLabel = false,
}) => {
  const handlePress = (selectedRating: number) => {
    if (editable && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  const getRatingLabel = (rating: number): string => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 3.5) return "Very Good";
    if (rating >= 2.5) return "Good";
    if (rating >= 1.5) return "Fair";
    return "Poor";
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {Array.from({ length: maxRating }).map((_, index) => {
          const starFilled = index < Math.floor(rating);
          const starHalf = !starFilled && index < Math.ceil(rating) && rating % 1 !== 0;
          
          return (
            <TouchableOpacity
              key={`star-${index}`}
              onPress={() => handlePress(index + 1)}
              disabled={!editable}
              style={styles.starButton}
            >
              <Star
                size={size}
                color={Colors.warning}
                fill={starFilled || starHalf ? Colors.warning : "transparent"}
                fillOpacity={starHalf ? 0.5 : 1}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      
      {showLabel && (
        <Text style={styles.ratingLabel}>
          {getRatingLabel(rating)} ({rating.toFixed(1)})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starButton: {
    padding: 2,
  },
  ratingLabel: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
});