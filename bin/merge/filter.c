#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_LINE 2048
#define MAX_COLUMN 500
#define NUM_OF_FILES 100

int set[MAX_COLUMN];
int reverse = 0;

void parse_selection(char* p) {
	char* last = p;
	int mode = 0;
	int from = 0;
	while (1) {
		if (p == last) {
			if (*p == ' ' || *p == ',') {
				last = ++p;
				continue;
			}
			if (*p == '\0') break;
		}
		if (*p == '\0') {
			int i = atoi(last);
			if (mode == 1) {
				for (int j=from; j<=i; j++)
					set[j] = 1;
				mode = 0;
			} else {
				set[i] = 1;
			}
			break;
		} else if (*p == ' ' || *p == ',') {
			int i = atoi(last);
			if (mode == 1) {
				for (int j=from; j<=i; j++)
					set[j] = 1;
				mode = 0;
			} else {
				set[i] = 1;
			}
			last = ++p;
		} else if (*p == '-') {
			*p = '\0';
			from = atoi(last);
			mode = 1;
			last = ++p;
		} else
			p++;
	}
}
void dump_selection() {
	for (int i=0; i<MAX_COLUMN; i++)
		if (set[i])
			printf("%d ", i);
	printf("\n");
}

int is_selected(int idx) {
	if (reverse) return set[idx]? 0:1;
	return set[idx];
}

int main(int argc, char* argv[]) {
	if (argv[1][0] == '-' && argv[1][1] == 'v') reverse = 1;
	// "0,1,3,4,6,7" filename1 filename2 filename3...
	char* selection = argv[1+reverse];

	parse_selection(selection);
#ifdef DEBUG
	dump_selection();
	return 0;
#endif
	int sidx = 2+reverse;
	int total = argc-sidx;
	for (int fi = sidx; fi<argc; fi++) {
		fprintf(stderr,"\rProgress: %.1f%%    ", ((fi-2.0)/total)*100);
		FILE *fp = fopen(argv[fi], "r");
		if (fp == NULL) {
			fprintf(stderr,"cannot find the file %s.\n", argv[fi]);
			continue;
		}
		char line[MAX_LINE];
		while (fgets(line, MAX_LINE, fp)) {
			// trim
			int index = 0;
			char* p = line;
			char* last = line;
			int selected[MAX_COLUMN];
			int selected_index = 0;
			while (*p == ' ') p++;
			if (*p == '\0' || *p == '\n') continue;
			while (1) {
				if (*p == ' ') {
					// we assume that the last column has been divided by two consequence space.
					if (p == last) {
						// label
						int label = atoi(p);
						selected[selected_index++] = label;
						break;
					} else {
						*p = '\0';
						int c = atoi(last);
						if (is_selected(index)) {
							selected[selected_index++] = c;
						} 
						last = p+1;
					}
					index++;
				}
				p++;
			}
			for (int i=0; i<selected_index; i++) {
				if (selected_index-1 == i)
					printf(" %d\n", selected[i]);
				else
					printf("%d ", selected[i]);
			}
		}
		fclose(fp);
	}
}
