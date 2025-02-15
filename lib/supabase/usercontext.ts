import React from 'react';
import { Session } from '@supabase/supabase-js';

export const SessionContext = React.createContext<Session | null>(null);