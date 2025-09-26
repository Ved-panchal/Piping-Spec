import { Subscription } from './interface';

export interface SubscriptionStatus {
  isActive: boolean;
  isExpired: boolean;
  isExpiringSoon: boolean;
  hasSubscription: boolean;
  daysUntilExpiry: number;
  status: 'active' | 'expired' | 'expiring_soon' | 'no_subscription';
  message: string;
}

export const checkSubscriptionStatus = (subscriptions?: Subscription[]): SubscriptionStatus => {
  // If no subscriptions exist, user is on free trial
  if (!subscriptions || subscriptions.length === 0) {
    return {
      isActive: true, // Allow basic access for free trial
      isExpired: false,
      isExpiringSoon: false,
      hasSubscription: false,
      daysUntilExpiry: 0,
      status: 'no_subscription',
      message: 'Free trial - limited features available.',
    };
  }

  // Get the most recent active subscription
  const activeSubscription = subscriptions.find(sub => sub.status === 'active');
  
  if (!activeSubscription) {
    // Check if there are any subscriptions that are just inactive/cancelled
    const hasAnySubscription = subscriptions.length > 0;
    
    return {
      isActive: !hasAnySubscription, // Allow access if never had subscription
      isExpired: hasAnySubscription, // Only mark expired if had subscription before
      isExpiringSoon: false,
      hasSubscription: hasAnySubscription,
      daysUntilExpiry: 0,
      status: hasAnySubscription ? 'expired' : 'no_subscription',
      message: hasAnySubscription 
        ? 'Your subscription has been cancelled or deactivated. Please renew your plan to continue using all features.'
        : 'Free trial - limited features available.',
    };
  }

  const endDate = new Date(activeSubscription.endDate);
  const today = new Date();
  // Reset time to compare only dates
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  
  const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Check if subscription is expired
  if (daysUntilExpiry < 0) {
    return {
      isActive: false,
      isExpired: true,
      isExpiringSoon: false,
      hasSubscription: true,
      daysUntilExpiry,
      status: 'expired',
      message: 'Your subscription has expired. Please renew your plan to continue accessing all features.',
    };
  }

  // Check if subscription is expiring soon (within 7 days)
  if (daysUntilExpiry <= 7) {
    return {
      isActive: true,
      isExpired: false,
      isExpiringSoon: true,
      hasSubscription: true,
      daysUntilExpiry,
      status: 'expiring_soon',
      message: `Your subscription expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}. Consider renewing to avoid service interruption.`,
    };
  }

  // Subscription is active
  return {
    isActive: true,
    isExpired: false,
    isExpiringSoon: false,
    hasSubscription: true,
    daysUntilExpiry,
    status: 'active',
    message: `Your subscription is active and expires on ${endDate.toLocaleDateString()}.`,
  };
};

export const canPerformAction = (
  subscriptions?: Subscription[], 
  actionType: 'create_project' | 'open_project' | 'create_spec' | 'export_data' = 'create_project'
): boolean => {
  const status = checkSubscriptionStatus(subscriptions);
  
  // Basic actions allowed for users without subscription or with active subscription
  if (actionType === 'open_project') {
    // Allow viewing projects even without subscription
    return !status.isExpired;
  }
  
  // For create/modify actions, require active subscription or no subscription (trial mode)
  if (actionType === 'create_project' || actionType === 'create_spec' || actionType === 'export_data') {
    return status.isActive && !status.isExpired;
  }
  
  return status.isActive && !status.isExpired;
};

export const getSubscriptionMessage = (
  subscriptions?: Subscription[], 
  actionType: 'create_project' | 'open_project' | 'create_spec' | 'export_data' = 'create_project'
): string => {
  const status = checkSubscriptionStatus(subscriptions);
  
  if (status.isExpired) {
    return 'Your subscription has expired. Please renew your plan to access this feature.';
  }
  
  if (!status.hasSubscription && (actionType === 'create_project' || actionType === 'create_spec')) {
    return 'This feature requires a subscription plan. Please subscribe to continue.';
  }
  
  if (status.isExpiringSoon) {
    return `Your subscription expires in ${status.daysUntilExpiry} day${status.daysUntilExpiry !== 1 ? 's' : ''}. Consider renewing to avoid service interruption.`;
  }
  
  return status.message;
};

export const formatSubscriptionEndDate = (endDate: string): string => {
  try {
    return new Date(endDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return 'Invalid date';
  }
};

// Check if user has reached project/spec limits
export const checkUsageLimits = (
  subscriptions?: Subscription[], 
  currentUsage: { projects: number; specs: number } = { projects: 0, specs: 0 }
): {
  canCreateProject: boolean;
  canCreateSpec: boolean;
  projectsRemaining: number;
  specsRemaining: number;
} => {
  const status = checkSubscriptionStatus(subscriptions);
  
  // If expired, no creation allowed
  if (status.isExpired) {
    return {
      canCreateProject: false,
      canCreateSpec: false,
      projectsRemaining: 0,
      specsRemaining: 0,
    };
  }

  // If no subscription (free trial), allow limited usage based on Free plan
  if (!status.hasSubscription) {
    const freeProjectLimit = 1;
    const freeSpecLimit = 1;
    
    return {
      canCreateProject: currentUsage.projects < freeProjectLimit,
      canCreateSpec: currentUsage.specs < freeSpecLimit,
      projectsRemaining: Math.max(0, freeProjectLimit - currentUsage.projects),
      specsRemaining: Math.max(0, freeSpecLimit - currentUsage.specs),
    };
  }

  const activeSubscription = subscriptions?.find(sub => sub.status === 'active');
  
  if (!activeSubscription) {
    return {
      canCreateProject: false,
      canCreateSpec: false,
      projectsRemaining: 0,
      specsRemaining: 0,
    };
  }

  // Get limits from subscription (null/undefined means unlimited)
  const maxProjects = activeSubscription.NoofProjects ?? null;
  const maxSpecs = activeSubscription.NoofSpecs ?? null;
  
  // Handle unlimited cases (null values in DB)
  const projectsRemaining = maxProjects === null ? Infinity : Math.max(0, maxProjects - currentUsage.projects);
  const specsRemaining = maxSpecs === null ? Infinity : Math.max(0, maxSpecs - currentUsage.specs);

  return {
    canCreateProject: projectsRemaining > 0,
    canCreateSpec: specsRemaining > 0,
    projectsRemaining,
    specsRemaining,
  };
};

// New utility function to check if user should see upgrade prompts
export const shouldShowUpgradePrompt = (subscriptions?: Subscription[]): boolean => {
  const status = checkSubscriptionStatus(subscriptions);
  return !status.hasSubscription || status.isExpired || status.isExpiringSoon;
};

// FIXED: Get user access level based on subscription data
export const getUserAccessLevel = (subscriptions?: Subscription[]): 'free_trial' | 'free' | 'weekly' | 'monthly' | 'yearly' | 'expired' => {
  const status = checkSubscriptionStatus(subscriptions);
  
  if (status.isExpired) return 'expired';
  if (!status.hasSubscription) return 'free_trial';
  
  const activeSubscription = subscriptions?.find(sub => sub.status === 'active');
  if (!activeSubscription) return 'free_trial';
  
  // Check plan name from subscription.plan.planName or fallback to checking limits
  const planName = activeSubscription.plan?.planName?.toLowerCase();
  
  if (planName) {
    if (planName === 'free') return 'free';
    if (planName === 'weekly') return 'weekly';
    if (planName === 'monthly') return 'monthly';
    if (planName === 'yearly') return 'yearly';
  }
  
  // Fallback: Determine plan type based on limits if plan name is not available
  const maxProjects = activeSubscription.NoofProjects;
  const maxSpecs = activeSubscription.NoofSpecs;
  
  // Yearly plan has null values for both projects and specs (unlimited)
  if (maxProjects === null && maxSpecs === null) {
    return 'yearly';
  }
  
  // Free plan: 1 project, 1 spec
  if (maxProjects === 1 && maxSpecs === 1) {
    return 'free';
  }
  
  // Weekly plan: 1 project, 5 specs
  if (maxProjects === 1 && maxSpecs === 5) {
    return 'weekly';
  }
  
  // Monthly plan: 2 projects, unlimited specs
  if (maxProjects === 2 && maxSpecs === null) {
    return 'monthly';
  }
  
  return 'free_trial';
};

// New utility function to check if plan has unlimited features
export const hasUnlimitedAccess = (subscriptions?: Subscription[]): boolean => {
  const activeSubscription = subscriptions?.find(sub => sub.status === 'active');
  if (!activeSubscription) return false;
  
  // Yearly plan has null values for projects and specs = unlimited
  return activeSubscription.NoofProjects === null && activeSubscription.NoofSpecs === null;
};

// FIXED: Get plan display info - no plan indication for paid plans, only show limits for free trial
export const getPlanDisplayInfo = (subscriptions?: Subscription[]): {
  planName: string;
  isUnlimited: boolean;
  showLimits: boolean;
} => {
  const userLevel = getUserAccessLevel(subscriptions);
  
  switch (userLevel) {
    case 'free_trial':
      return {
        planName: 'Free Trial',
        isUnlimited: false,
        showLimits: true, // Show limits for free trial
      };
    case 'free':
      return {
        planName: '', // No plan name display for paid plans
        isUnlimited: false,
        showLimits: true, // Show remaining projects for paid plans
      };
    case 'weekly':
      return {
        planName: '', // No plan name display for paid plans
        isUnlimited: false,
        showLimits: true, // Show remaining projects for paid plans
      };
    case 'monthly':
      return {
        planName: '', // No plan name display for paid plans
        isUnlimited: false,
        showLimits: true, // Show remaining projects for paid plans
      };
    case 'yearly':
      return {
        planName: '', // No plan name display for paid plans
        isUnlimited: true,
        showLimits: false, // Don't show limits for yearly (unlimited)
      };
    case 'expired':
      return {
        planName: 'Expired',
        isUnlimited: false,
        showLimits: false,
      };
    default:
      return {
        planName: 'Free Trial',
        isUnlimited: false,
        showLimits: true,
      };
  }
};