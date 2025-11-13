import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { JobFilters, JOB_CATEGORIES, CONTRACT_TYPES } from '@nibjobs/shared';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: JobFilters;
  onApplyFilters: (filters: JobFilters) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApplyFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<JobFilters>(filters);

  const toggleCategory = (category: string) => {
    const categories = localFilters.categories || [];
    if (categories.includes(category)) {
      setLocalFilters({
        ...localFilters,
        categories: categories.filter(c => c !== category),
      });
    } else {
      setLocalFilters({
        ...localFilters,
        categories: [...categories, category],
      });
    }
  };

  const toggleContractType = (contractType: string) => {
    const contractTypes = localFilters.contractTypes || [];
    if (contractTypes.includes(contractType as any)) {
      setLocalFilters({
        ...localFilters,
        contractTypes: contractTypes.filter(c => c !== contractType),
      });
    } else {
      setLocalFilters({
        ...localFilters,
        contractTypes: [...contractTypes, contractType as any],
      });
    }
  };

  const setRemoteFilter = (isRemote: boolean | undefined) => {
    setLocalFilters({
      ...localFilters,
      isRemote,
    });
  };

  const clearAllFilters = () => {
    setLocalFilters({});
  };

  const applyFilters = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={applyFilters}>
            <Text style={styles.applyButton}>Apply</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Job Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Categories</Text>
            <View style={styles.optionsGrid}>
              {JOB_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.option,
                    (localFilters.categories || []).includes(category) && styles.selectedOption,
                  ]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      (localFilters.categories || []).includes(category) && styles.selectedOptionText,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contract Types */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contract Type</Text>
            <View style={styles.optionsGrid}>
              {CONTRACT_TYPES.map((contractType) => (
                <TouchableOpacity
                  key={contractType}
                  style={[
                    styles.option,
                    (localFilters.contractTypes || []).includes(contractType) && styles.selectedOption,
                  ]}
                  onPress={() => toggleContractType(contractType)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      (localFilters.contractTypes || []).includes(contractType) && styles.selectedOptionText,
                    ]}
                  >
                    {contractType}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Remote Work */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Location</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.option,
                  localFilters.isRemote === undefined && styles.selectedOption,
                ]}
                onPress={() => setRemoteFilter(undefined)}
              >
                <Text
                  style={[
                    styles.optionText,
                    localFilters.isRemote === undefined && styles.selectedOptionText,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.option,
                  localFilters.isRemote === true && styles.selectedOption,
                ]}
                onPress={() => setRemoteFilter(true)}
              >
                <Text
                  style={[
                    styles.optionText,
                    localFilters.isRemote === true && styles.selectedOptionText,
                  ]}
                >
                  Remote Only
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.option,
                  localFilters.isRemote === false && styles.selectedOption,
                ]}
                onPress={() => setRemoteFilter(false)}
              >
                <Text
                  style={[
                    styles.optionText,
                    localFilters.isRemote === false && styles.selectedOptionText,
                  ]}
                >
                  On-site Only
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Clear Filters */}
          <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
            <Text style={styles.clearButtonText}>Clear All Filters</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6b7280',
  },
  applyButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#ffffff',
  },
  clearButton: {
    marginTop: 20,
    marginBottom: 40,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '600',
  },
});

export default FilterModal;