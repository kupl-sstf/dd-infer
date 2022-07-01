#include <stdio.h>
#include <stdlib.h>

#define MAX_LINE 1024
typedef struct _LEN {
	int last;
	int last_blank;
} LEN;
LEN len(char* p) {
	LEN e = {0, 0};
	while (1) {
		if (*p == '\n' || *p == '\0') return e;
		if (*p == ' ') e.last_blank = e.last;
		e.last++;
		p++;
	}
}
int compare(char* p1, char* p2) {
	while (*p1 != '\0') {
		if (*p2 == '\0') return 1;
		if (*p1 != *p2) return 0;
		p1++; p2++;
	}
	return 1;
}

int main(int argc, char* argv[])
{
    if (argc < 4) {
        printf("not enough argument.\n");
        return 1;
    }
    char const* const filename = argv[1];
    char const* const posname = argv[2];
    char const* const negname = argv[3];
    FILE* fp = fopen(filename, "r");
    if (fp == NULL) {
        printf("cannot open the file %s.\n", filename);
	return 1;
    }
    fseek(fp, 0L, SEEK_END);
    int total = ftell(fp);
    rewind(fp);
    char line[MAX_LINE], line2[MAX_LINE];
    char* p = line;
    LEN size;
    int label;
    FILE* f_pos = fopen(posname, "w");
    FILE* f_neg = fopen(negname, "w");
    int current = 0, iter = 0;

    while (fgets(p, MAX_LINE, fp)) {
        iter++;
        size = len(p);
	current += size.last + 1;
	if (iter % 1000 == 0) {
		printf("\rProgress: %.1f%%    ", ((float)current/total)*100);
		iter=0;
	}
	p[size.last] = 0;
	label = atoi(&p[size.last_blank]);
	p[size.last_blank] = 0;
	if (compare(line, line2) == 0) {
		p[size.last_blank] = ' ';
		if (label == 1) {
			fprintf(f_pos, "%s\n", p);
		} else {
			fprintf(f_neg, "%s\n", p);
		}
		p[size.last_blank] = 0;
	}
	if (p == line) {
		p = line2;
	} else {
		p = line;
	}
    }

    fclose(fp);
    fclose(f_pos);
    fclose(f_neg);
    printf("\rProgress: 100%%  \n");

    return 0;
}

