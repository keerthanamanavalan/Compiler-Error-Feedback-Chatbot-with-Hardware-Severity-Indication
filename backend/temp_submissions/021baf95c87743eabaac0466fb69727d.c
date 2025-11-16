#include <stdio.h>

int main() {
    char str[100];

    scanf("%[^\n]", str); 

    printf("You entered: %s\n", str);

    return 0;
}
