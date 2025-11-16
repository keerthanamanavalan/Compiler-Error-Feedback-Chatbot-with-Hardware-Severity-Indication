#include <stdio.h>

int main() {
    char str[100];
    scanf("%[^\n]", str); // reads input until newline (including spaces)

    printf("You entered: %s\n", str);

    return 0;
}