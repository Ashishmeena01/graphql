#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

int main()
{
    size_t size = 100 * 1024 * 1024;

    char *memory = (char*)malloc(size);

    printf("PID: %d\n", getpid());
    printf("Memory allocated: %zu MB\n", size / (1024 * 1024));

    getchar();

    for (size_t i = 0; i < size; i += 4096)
    {
        memory[i] = 1;
    }

    printf("Memory touched. Press Enter.\n");
    getchar();

    free(memory);
    return 0;
}