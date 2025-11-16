#include <stdio.h>

int main() {
    int numbers[5];
    int sum = 0;
    float average;
    
    for (int i = 0; i < 5; i++) { 
        scanf("%d", &numbers[i]);
    }

    for (int i = 0; i < 5; i++) {
        sum = sum + numbers[i];
    }

    average = (float)sum / 5;             
    printf("Average is: %f\n", average);

    if (average > 50) { 
        printf("Average is: %f\n", average);
    } else                        
        printf("Average is: %f\n", average);
    
    return 0;
}