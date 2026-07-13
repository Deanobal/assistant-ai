import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FALLBACK_MESSAGE = 'Our live voice demo is being connected. You can still get started or leave your details and we’ll send access.';
const CALL_START_TIMEOUT_MS = 12000;
const PRODUCTION_REBUILD_MARK