#include <stdio.h>

int addNumbers(int a, int b) {
    return a + b;
}

int main() {
    int num1 = 10;
    int num2 = 20;
    int sum;

    sum = addNumbers(num1, num2);

    printf("Sum of %d and %d is %d\n", num1, num2, sum);

    if (sum > 10) {
        printf("The sum is greater than 10\n");
    } else {
        printf("The sum is less than or equal to 10\n");
    }

    prinf("This line has an error!\n"); 

    return 0;
}

