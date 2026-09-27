declare module "@paystack/inline-js" {
  type Callbacks = {
    onSuccess?: (tx: { reference: string; status: string; trans: string }) => void;
    onCancel?: () => void;
    onLoad?: () => void;
    onError?: (error: { message?: string }) => void;
  };
  export default class PaystackPop {
    resumeTransaction(accessCode: string, callbacks?: Callbacks): void;
    newTransaction(options: Record<string, unknown> & Callbacks): void;
  }
}
