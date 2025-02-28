// Trello data models

export interface TrelloAuth {
    apiKey: string;
    token: string;
}

export interface TrelloMember {
    id: string;
    activityBlocked: boolean;
    avatarHash: string;
    avatarUrl: string;
    bio: string;
    bioData: {
        emoji: Record<string, any>;
    };
    confirmed: boolean;
    fullName: string;
    idEnterprise: string | null;
    idEnterprisesDeactivated: string[];
    idMemberReferrer: string | null;
    idPremOrgsAdmin: string[];
    initials: string;
    memberType: string;
    nonPublic: Record<string, any>;
    nonPublicAvailable: boolean;
    products: string[];
    url: string;
    username: string;
    status: string;
    aaEmail: string | null;
    aaId: string | null;
    email: string | null;
    gravatarHash: string;
    idBoards: string[];
    idOrganizations: string[];
    loginTypes: string[];
    marketingOptIn: {
        optedIn: boolean;
        date: string;
    };
    messagesDismissed: Record<string, any>[];
    oneTimeMessagesDismissed: string[];
    prefs: {
        sendSummaries: boolean;
        minutesBetweenSummaries: number;
        minutesBeforeDeadlineToNotify: number;
        colorBlind: boolean;
        locale: string;
    };
    trophies: string[];
    uploadedAvatarHash: string | null;
    uploadedAvatarUrl: string | null;
    premiumFeatures: string[];
    isAaMastered: boolean;
    ixUpdate: string;
    limits: Record<string, any>;
}

export interface TrelloBoard {
    id: string;
    name: string;
    desc: string;
    descData: {
        emoji: Record<string, any>;
    };
    closed: boolean;
    idOrganization: string;
    idEnterprise: string | null;
    pinned: boolean;
    url: string;
    shortUrl: string;
    prefs: {
        permissionLevel: string;
        hideVotes: boolean;
        voting: string;
        comments: string;
        invitations: string;
        selfJoin: boolean;
        cardCovers: boolean;
        isTemplate: boolean;
        cardAging: string;
        calendarFeedEnabled: boolean;
        background: string;
        backgroundImage: string | null;
        backgroundImageScaled: {
            width: number;
            height: number;
            url: string;
        }[] | null;
        backgroundTile: boolean;
        backgroundBrightness: string;
        backgroundBottomColor: string;
        backgroundTopColor: string;
        canBePublic: boolean;
        canBeEnterprise: boolean;
        canBeOrg: boolean;
        canBePrivate: boolean;
        canInvite: boolean;
    };
    labelNames: {
        green: string;
        yellow: string;
        orange: string;
        red: string;
        purple: string;
        blue: string;
        sky: string;
        lime: string;
        pink: string;
        black: string;
    };
    limits: Record<string, any>;
    starred: boolean;
    memberships: {
        id: string;
        idMember: string;
        memberType: string;
        unconfirmed: boolean;
        deactivated: boolean;
    }[];
    enterpriseOwned: boolean;
}

export interface TrelloList {
    id: string;
    name: string;
    closed: boolean;
    idBoard: string;
    pos: number;
    subscribed: boolean;
    softLimit: number | null;
    status: string | null;
    creationMethod: string | null;
    limits: Record<string, any>;
}

export interface TrelloCard {
    id: string;
    badges: {
        attachmentsByType: {
            trello: {
                board: number;
                card: number;
            };
        };
        location: boolean;
        votes: number;
        viewingMemberVoted: boolean;
        subscribed: boolean;
        fogbugz: string;
        checkItems: number;
        checkItemsChecked: number;
        checkItemsEarliestDue: string | null;
        comments: number;
        attachments: number;
        description: boolean;
        due: string | null;
        dueComplete: boolean;
        start: string | null;
    };
    checkItemStates: any[];
    closed: boolean;
    dueComplete: boolean;
    dateLastActivity: string;
    desc: string;
    descData: {
        emoji: Record<string, any>;
    };
    due: string | null;
    dueReminder: string | null;
    email: string | null;
    idBoard: string;
    idChecklists: string[];
    idList: string;
    idMembers: string[];
    idMembersVoted: string[];
    idShort: number;
    idAttachmentCover: string | null;
    labels: {
        id: string;
        idBoard: string;
        name: string;
        color: string;
    }[];
    idLabels: string[];
    manualCoverAttachment: boolean;
    name: string;
    pos: number;
    shortLink: string;
    shortUrl: string;
    start: string | null;
    subscribed: boolean;
    url: string;
    cover: {
        idAttachment: string | null;
        color: string | null;
        idUploadedBackground: string | null;
        size: string;
        brightness: string;
        idPlugin: string | null;
    };
    isTemplate: boolean;
    cardRole: string | null;
}

export interface TrelloLabel {
    id: string;
    idBoard: string;
    name: string;
    color: string;
}

export interface TrelloWebhook {
    id: string;
    description: string;
    idModel: string;
    callbackURL: string;
    active: boolean;
    consecutiveFailures: number;
    firstConsecutiveFailDate: string | null;
}

export interface TrelloCardMoved {
    action: {
        display: {
            translationKey: string;
            entities: {
                card: {
                    type: string;
                    idList: string;
                    id: string;
                    shortLink: string;
                    text: string;
                };
                listBefore: {
                    type: string;
                    id: string;
                    text: string;
                };
                listAfter: {
                    type: string;
                    id: string;
                    text: string;
                };
                memberCreator: {
                    type: string;
                    id: string;
                    username: string;
                    text: string;
                };
            };
        };
    };
}

export interface TrelloNewCard {
    action: {
        display: {
            translationKey: string;
            entities: {
                card: {
                    type: string;
                    id: string;
                    shortLink: string;
                    text: string;
                };
                list: {
                    type: string;
                    id: string;
                    text: string;
                };
                memberCreator: {
                    type: string;
                    id: string;
                    username: string;
                    text: string;
                };
            };
        };
    };
}

export interface TrelloWebhookPayload {
    action: {
        id: string;
        idMemberCreator: string;
        data: Record<string, any>;
        appCreator: {
            id: string;
            name: string;
        } | null;
        type: string;
        date: string;
        limits: Record<string, any>;
        display: {
            translationKey: string;
            entities: Record<string, any>;
        };
        memberCreator: {
            id: string;
            activityBlocked: boolean;
            avatarHash: string;
            avatarUrl: string;
            fullName: string;
            idMemberReferrer: string | null;
            initials: string;
            nonPublic: Record<string, any>;
            nonPublicAvailable: boolean;
            username: string;
        };
    };
    model: Record<string, any>;
}
