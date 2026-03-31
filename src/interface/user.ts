export interface UserProfile {
    display_name: string;
    full_name: string;
    avatar_url: string;
    bio: string;
    location: string;
    website: string;
    country_code: string;
    phone: string;
}

export interface UserRole {
    id: string;
    name: string;
}

export interface UserData {
    id: string;
    email: string;
    profile: UserProfile;
    token_version: number;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    roles: UserRole[];
}

