#include <stdio.h>

int main() {
    char str[100];

    printf("Enter a string: ");
    scanf("%[^\n]", str); // reads input until newline (including spaces)

    printf("You entered: %s\n", str);

    return 0;
}