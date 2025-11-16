#include <stdio.h>

int factorial(int n) {
    if (n == 0) return 1;
    return n * factorial(n - 1);
}

int main() {
    int x = 5
    int result = factorial(x);
    printf("Factorial of %d is %f\n", x, result);
    if (result = 120) {
        printf("Correct!\n");
    }
    // Intentional bug: using undeclared variable 'y' below
    printf("Value of y: %d\n", y);

    return 0;
}
