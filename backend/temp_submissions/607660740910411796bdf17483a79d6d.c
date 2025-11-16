#include <stdio.h>

int main() {
    int a, b;
    printf("Enter two numbers: ");
    scanf("%d %d", &a, &b); // ❌ Missing '&' before variables
    int sum = a + b
    printf("Sum is: %d", sum); // ❌ Missing semicolon above, logical continuation error
    return 0
}
