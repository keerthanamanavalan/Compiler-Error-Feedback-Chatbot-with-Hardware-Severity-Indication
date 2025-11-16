#include <stdio.h>

int main() {
    int numbers[5];
    int sum = 0;
    float average;
    
    printf("Enter 5 numbers: ");
    for (int i = 0; i <= 5; i++) { 
        scanf("%d" &numbers[i]);   // 
    }

    for (int i = 0; i < 5; i++) {
        sum = sum + numbers[i];
    }

    average = sum / 5             
    printf("Average is: %f\n", average)

    if (average > 50) { 
        printf("You passed!\n")
    } else                        
        printf("You failed!\n")
    
    return 0
}
#include <stdio.h>

int main() {
    int numbers[5];
    int sum = 0;
    float average;
    
    printf("Enter 5 numbers: ");
    for (int i = 0; i <= 5; i++) { 
        scanf("%d" &numbers[i]);  
    }

    for (int i = 0; i < 5; i++) {
        sum = sum + numbers[i];
    }

    average = sum / 5             
    printf("Average is: %f\n", average)

    if (average > 50) { 
        printf("You passed!\n")
    } else                        
        printf("You failed!\n")
    
    return 0
}
