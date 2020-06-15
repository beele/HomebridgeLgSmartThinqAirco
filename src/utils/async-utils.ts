export class AsyncUtils {

    public static debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
        let timeout: ReturnType<typeof setTimeout> | null = null;

        const debounced = (...args: Parameters<F>) => {
            if (timeout !== null) {
                clearTimeout(timeout);
                timeout = null;
            }
            timeout = setTimeout(() => func(...args), waitFor);
        };

        return debounced as (...args: Parameters<F>) => ReturnType<F>;
    };

    public static sleep = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };
}