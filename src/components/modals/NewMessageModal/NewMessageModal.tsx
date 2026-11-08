import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import {
  ArrowRightIcon,
  CloseIcon,
  FanSuiteIcon,
  SearchIcon,
  VerifiedIcon,
} from '@/components/icons';
import { MOCK_CONTACTS, resolveSelectedUsers } from '@/features/contacts';
import { colors, fontFamilies, fontSizes, fontWeights, lineHeights } from '@/theme';

const avatar = require('@/assets/images/avatar.png');

export type NewMessageModalProps = {
  close: () => void;
  onStartChat?: (selectedIds: string[]) => void;
};

function SelectionCheckbox({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
      {selected ? <Text style={styles.checkmark}>✓</Text> : null}
    </View>
  );
}

export function NewMessageModal({ close, onStartChat }: NewMessageModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set(['user-1']));
  const resolvedRecipientCount = useMemo(
    () => resolveSelectedUsers([...selectedIds]).length,
    [selectedIds],
  );

  const filteredContacts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return MOCK_CONTACTS;

    return MOCK_CONTACTS.filter(
      ({ name, subtitle }) =>
        name.toLowerCase().includes(normalizedQuery) ||
        subtitle.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const toggleContact = (contactId: string) => {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(contactId)) nextIds.delete(contactId);
      else nextIds.add(contactId);

      return nextIds;
    });
  };

  const handleStartChat = () => {
    const ids = [...selectedIds];
    if (!ids.length) return;

    close();
    setTimeout(() => onStartChat?.(ids), 220);
  };

  const buttonTitle =
    resolvedRecipientCount > 1 ? `Message to (${resolvedRecipientCount}) Users` : 'Start Chat';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New message</Text>
        <Pressable
          accessibilityLabel="Close new message"
          accessibilityRole="button"
          hitSlop={10}
          onPress={close}
          style={({ pressed }) => pressed && styles.pressed}>
          <CloseIcon color={colors.textSecondary} height={20} width={20} />
        </Pressable>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <SearchIcon color={colors.mutedForeground} />
          <BottomSheetTextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            placeholder="Search for users on FanSuite"
            placeholderTextColor={colors.mutedForeground}
            selectionColor={colors.primary}
            style={styles.searchInput}
            value={query}
          />
        </View>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {filteredContacts.map((contact, index) => {
          const selected = selectedIds.has(contact.id);
          const showSectionDivider = contact.kind === 'profile' && index > 0 && filteredContacts[index - 1]?.kind === 'fan';

          return (
            <View key={contact.id}>
              {showSectionDivider ? <View style={styles.sectionDivider} /> : null}
              <Pressable
                accessibilityLabel={`${selected ? 'Deselect' : 'Select'} ${contact.name}`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                onPress={() => toggleContact(contact.id)}
                style={({ pressed }) => [
                  styles.contactRow,
                  selected && styles.contactRowSelected,
                  pressed && styles.pressed,
                ]}>
                <SelectionCheckbox selected={selected} />

                {contact.kind === 'profile' ? (
                  <Avatar accessibilityLabel={`${contact.name} avatar`} size={32} source={avatar} />
                ) : (
                  <View style={styles.fanSuiteIcon}>
                    <FanSuiteIcon color={colors.foreground} />
                  </View>
                )}

                <View style={styles.contactIdentity}>
                  <View style={styles.contactNameRow}>
                    <Text numberOfLines={1} style={styles.contactName}>
                      {contact.name}
                    </Text>
                    {contact.kind === 'profile' && contact.verified ? (
                      <VerifiedIcon height={20} width={20} />
                    ) : null}
                  </View>
                  <Text numberOfLines={1} style={styles.contactSubtitle}>
                    {contact.subtitle}
                  </Text>
                </View>
              </Pressable>
            </View>
          );
        })}
      </BottomSheetScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          disabled={!resolvedRecipientCount}
          onPress={handleStartChat}
          style={({ pressed }) => [
            styles.startButton,
            !resolvedRecipientCount && styles.startButtonDisabled,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.startButtonText}>{buttonTitle}</Text>
          <ArrowRightIcon />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    color: colors.foreground,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: 30,
  },
  searchSection: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchContainer: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: 12,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
  },
  searchInput: {
    height: '100%',
    minWidth: 0,
    flex: 1,
    color: colors.foreground,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  listContent: {
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionDivider: {
    height: 1,
    marginBottom: 12,
    backgroundColor: colors.border,
  },
  contactRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: 16,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  contactRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.messageOutgoing,
  },
  checkbox: {
    width: 24,
    height: 24,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: 6,
    backgroundColor: colors.background,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.background,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: 20,
  },
  fanSuiteIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactIdentity: {
    minWidth: 0,
    flex: 1,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactName: {
    minWidth: 0,
    flexShrink: 1,
    color: colors.foreground,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.md,
  },
  contactSubtitle: {
    color: colors.mutedForeground,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.sm,
  },
  footer: {
    minHeight: 76,
    alignItems: 'flex-end',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  startButton: {
    minWidth: 212,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 14,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.1)',
  },
  startButtonDisabled: {
    opacity: 0.45,
  },
  startButtonText: {
    color: colors.background,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.md,
  },
  pressed: {
    opacity: 0.7,
  },
});
