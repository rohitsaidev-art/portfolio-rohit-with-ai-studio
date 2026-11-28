import type { FlexCarouselFocusRect } from '../components/FlexCarousel';

export interface CaseStudyTransitionRequest {
  id: number;
  slug: string;
  imageSrc: string;
  title: string;
  rect: FlexCarouselFocusRect;
  borderRadius: number;
  onNavigateNow: () => void;
}

type TransitionListener = (request: CaseStudyTransitionRequest | null) => void;

let currentRequest: CaseStudyTransitionRequest | null = null;
let nextRequestId = 1;
const listeners = new Set<TransitionListener>();

function emit() {
  listeners.forEach((listener) => listener(currentRequest));
}

export function startCaseStudyTransition(
  payload: Omit<CaseStudyTransitionRequest, 'id'>,
): number {
  const id = nextRequestId++;
  currentRequest = { ...payload, id };
  emit();
  return id;
}

export function clearCaseStudyTransition(id?: number): void {
  if (id !== undefined && currentRequest && currentRequest.id !== id) {
    return;
  }
  if (!currentRequest) return;
  currentRequest = null;
  emit();
}

export function getActiveCaseStudyTransition(): CaseStudyTransitionRequest | null {
  return currentRequest;
}

export function subscribeCaseStudyTransition(
  listener: TransitionListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
