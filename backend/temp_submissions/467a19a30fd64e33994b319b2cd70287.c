#include <stdio.h>

int main() {
    int a = 10;
    int b = 20;
    int *p1, *p2;

    p1 = &a;
    p2 = &b;

    printf("Value of a: %d\n", *p1);
    printf("Value of b: %d\n", *p2);

    int sum = *p1 + *p2;
    printf("Sum = %d\n", sum);

    *p1 = *p1 + 5;
    *p2 = *p2 + 10;

    printf("Updated a = %d\n", *p1);
    printf("Updated b = %d\n", *p2);

    int *p3;
    *p3 = sum;   // ❌ ERROR: using uninitialized pointer (undefined behavior)

    printf("Value of p3 = %d\n", *p3);

    return 0;
}

