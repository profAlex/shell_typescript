class TrieNode {
    children: Map<string, TrieNode> = new Map();
    isEndOfWord: boolean = false;
}

export class Trie {
    private root = new TrieNode();


    getRoot(): TrieNode {
        return this.root;
    }

    insertWord(word: string): void {
        let current = this.root;
        for (const char of word) {
            if (!current.children.has(char)) {
                current.children.set(char, new TrieNode());
            }
            current = current.children.get(char)!;
        }

        current.isEndOfWord = true;
    }

    searchWord(word: string): boolean {
        let current = this.root;
        for (const char of word) {
            if (!current.children.has(char)) {
                return false;
            }
            current = current.children.get(char)!;
        }

        return current.isEndOfWord;
    }
}


export function listRootAutoCompletions(trieExemplar: Trie): string[] {
    let listOfWords: string[] = [];
    let nodeStart = trieExemplar.getRoot();

    function getWord(currentWord: string, node: TrieNode) {
        if(node.isEndOfWord) {
            listOfWords.push(currentWord);
        }

        for (const [char, nextNode] of node.children) {
            getWord(currentWord+char, nextNode);
        }
    }

    for (const [firstLetter, childNode] of nodeStart.children)
    {
        getWord(firstLetter, childNode);
    }

    //
    // for(const [firstLetter, anotherNode] of nodeStart.children) {
    //     let newWord:string = firstLetter;
    //
    //     function getWord(node: TrieNode): void {
    //         let current = node;
    //         for (const [char, nextNode] of current.children) {
    //             newWord += char;
    //             if (current.isEndOfWord === true) {
    //                 listOfWords.push(newWord);
    //             }
    //             getWord(nextNode);
    //         }
    //     }
    //
    //     getWord(anotherNode);
    // }
    //

    return listOfWords;

}