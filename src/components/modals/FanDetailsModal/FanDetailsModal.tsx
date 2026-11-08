import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type { ComponentType, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { Avatar } from '@/components/Avatar';
import { IconButton } from '@/components/IconButton';
import {
  CloseIcon,
  EditIcon,
  FanSuiteIcon,
  HeartIcon,
  LocationIcon,
  RebillIcon,
  StarIcon,
} from '@/components/icons';
import { colors, fontFamilies, fontSizes, fontWeights, lineHeights } from '@/theme';

const avatar = require('@/assets/images/avatar.png');

export type FanDetailsModalProps = {
  close: () => void;
};

type DetailCardProps = {
  children: ReactNode;
  icon: ComponentType<SvgProps>;
  muted?: boolean;
  editable?: boolean;
};

function DetailCard({ children, editable, icon: Icon, muted }: DetailCardProps) {
  return (
    <View style={styles.detailCard}>
      <Icon color={muted ? colors.disabled : colors.textSecondary} />
      <View style={styles.detailCardContent}>{children}</View>
      {editable ? (
        <Pressable accessibilityLabel="Edit detail" accessibilityRole="button" hitSlop={8}>
          <EditIcon />
        </Pressable>
      ) : null}
    </View>
  );
}

export function FanDetailsModal({ close }: FanDetailsModalProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fan Details</Text>
        <IconButton
          accessibilityLabel="Close fan details"
          backgroundColor={colors.textSecondary}
          icon={CloseIcon}
          iconColor={colors.background}
          onPress={close}
          size={32}
          withInsetShadow={false}
        />
      </View>

      <BottomSheetScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.profile}>
          <Avatar
            accessibilityLabel="Ethan Shoots avatar"
            size={120}
            source={avatar}
            status="offline"
            statusSize={24}
          />
          <Text style={styles.displayName}>Ethan Shoots</Text>
          <Text style={styles.username}>@ethan_shoots</Text>
        </View>

        <View style={styles.bioCard}>
          <View style={styles.bioHeader}>
            <Text style={styles.cardTitle}>User BIO</Text>
            <Pressable accessibilityLabel="Edit user bio" accessibilityRole="button" hitSlop={8}>
              <EditIcon />
            </Pressable>
          </View>
          <Text style={styles.bioText}>
            Alex Rivera is a 27-year-old from Austin, Texas, who enjoys playing basketball,
            going to the gym, and spending weekends hiking or cycling around the city. In his
            free time, he also likes photography, trying new coffee shops, and hanging out with
            friends.
          </Text>
          <View style={styles.aiBadge}>
            <StarIcon color={colors.customSecondary500} height={14} width={14} />
            <Text style={styles.aiText}>AI</Text>
          </View>
        </View>

        <DetailCard editable icon={LocationIcon}>
          <Text style={styles.detailText}>Austin, Texas, US</Text>
        </DetailCard>

        <DetailCard editable icon={HeartIcon} muted>
          <Text style={styles.placeholderText}>Click to add preferences</Text>
        </DetailCard>

        <DetailCard icon={FanSuiteIcon}>
          <Text style={styles.detailText}>
            Fan in <Text style={styles.linkText}>FanSuite Name</Text>
          </Text>
          <Text style={styles.detailCaption}>Since 12/02/2026</Text>
        </DetailCard>

        <DetailCard icon={RebillIcon}>
          <View style={styles.rebillContent}>
            <Text style={styles.detailText}>Rebill</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>On</Text>
            </View>
          </View>
        </DetailCard>

        <View style={styles.activityCard}>
          <View style={styles.activityStatus} />
          <View style={styles.activityColumn}>
            <Text style={styles.detailCaption}>Last Online</Text>
            <Text style={styles.detailText}>Today, 12:20</Text>
          </View>
          <View style={styles.activityColumn}>
            <Text style={styles.detailCaption}>Last Response</Text>
            <Text style={styles.detailText}>12/10 2026, 12:20</Text>
          </View>
        </View>
      </BottomSheetScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  title: {
    color: colors.foreground,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: 30,
  },
  scrollContent: {
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  profile: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  displayName: {
    marginTop: 16,
    color: colors.foreground,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.md,
  },
  username: {
    marginTop: 2,
    color: colors.primary,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.xs,
  },
  bioCard: {
    minHeight: 160,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: 16,
    padding: 12,
  },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: colors.foreground,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.sm,
  },
  bioText: {
    color: colors.textSecondary,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.sm,
  },
  aiBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 18,
    backgroundColor: '#F0E9FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  aiText: {
    color: colors.customSecondary500,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  },
  detailCard: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailCardContent: {
    minWidth: 0,
    flex: 1,
  },
  detailText: {
    color: colors.textSecondary,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.md,
  },
  placeholderText: {
    color: colors.disabled,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.md,
  },
  linkText: {
    color: colors.primary,
  },
  detailCaption: {
    color: colors.disabled,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.sm,
  },
  rebillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    borderRadius: 18,
    backgroundColor: colors.success,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  statusText: {
    color: colors.background,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
  activityCard: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activityStatus: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.disabled,
  },
  activityColumn: {
    minWidth: 0,
    flex: 1,
  },
});
