import { RefObject } from "react";

export interface PMSItem {
    key: string;
    compType: string;
    compCode:string;
    itemDescription: string;
    c_code?:string;
    g_type:string;
    s_type:string;
    size1: string;
    size2: string;
    schedule: string;
    rating: string;
    material: string;
    dimensionalStandard: string;
}
  
export interface ComponentDesc {
    key: string;
    itemDescription: string;
    ratingrequired?: boolean;
    code: string;
    c_code: string;
    g_type: string;
    s_type: string;
    short_code: string;
}
  
export interface Component {
    id: number;
    componentname: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ApiError extends Error {
    response?: {
      data?: {
        error?: string;
      };
      status?: number;
    };
}

export interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
}

export interface ProjectFormValues {
    code: string;
    description: string;
    company: string;
}

export interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (project: ProjectFormValues) => void;
    project?: ProjectFormValues | null; // Optional project prop for edit mode
}
  
export interface InputProps {
    type: string;
    name: string;
    placeholder: string;
    className?: string;
    innerRef?: RefObject<HTMLInputElement>;
    autoFocus?: boolean;
    disabled?:boolean;
}

export interface LoginFormValues {
    Email: string;
    password: string;
}

export interface LoginModalProps {
    isOpen: boolean;
    closeModal: () => void;
    onLoginSuccess: (user: { name: string }) => void; // New prop
}

export interface MaterialData {
    key: string;
    code: string;
    c_code: string;
    material_description: string;
    base_material: string;
}

export interface Schedule {
    key: string;
    sch1_sch2: string;
    code: string;
    c_code: string;
    arrange_od:string;
    schDesc: string;
}

export interface Size {
    key: string;
    size1_size2: string;
    code: string;
    c_code:string;
    size_inch: string;
    size_mm: number;
    od: string;
}

export interface SizeRange {
    id?:number
    key: number | string;
    sizeValue: string;
    odValue?:string;
    sizeCode: string;
    scheduleValue: string;
    scheduleCode: string;
  }
  
export interface Rating {
    key: string;
    ratingCode?: string;
    ratingValue: string;
    c_rating_code?: string;
}

export interface DimensionalStandard {
    id: string;
    component_id: string;
    dimensional_standard: string;
}

export type SizeCode = string;
export interface DropdownOption {
    label: string;
    value: string;
    g_type?: string;
    s_type?: string;
    c_code?:string;
    shortCode?:string;
    ratingRequired?: boolean;
    sizeToScheduleMap?: Record<SizeCode, Array<{ scheduleCode: string }>>;
}

export interface Spec {
    id: string;
    specName: string;
    rating: string;
    baseMaterial: string;
}

export interface Plan {
    name: string;
    Price: number;
    description: string;
    benefits: Array<string>;
  }

export interface PricingCardProps {
    name: string;
    Price: number;
    description?: string;
    benefits:Array<string>;
    showButton: boolean;
    index: number;
    openModal?: (index:number) => void;
}

export interface Project {
    id: string;
    projectCode: string;        
    projectDescription: string; 
    companyName: string;        
}

export interface DeleteResponse {
    data: {
      success: boolean;
      message: string;
      error?: string;
    }
}
