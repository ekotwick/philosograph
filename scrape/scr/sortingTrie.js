'use strict';

class UrlTrieNode {
  constructor(val) {
    this.value = val;
    this.children = {};
    this.url = '';
    this.urlCompleted = false;
  }

  completesUrl() {
    return this.urlCompleted;
  }

  getUrl() {
    return this.url;
  }

  hasChildren() {
    return Object.keys(this.children).length;
  }
}

class UrlTrie {
  constructor() {
    this.root = new UrlTrieNode('');
    this.length = 0;
  }

  insert(url) {
    let node = this.root;

    for (let i = 0; i < url.length; i++) {
      let currCh = url[i];
      if (node.children[currCh]) node = node.children[currCh];
      else {
        node.children[currCh] = new UrlTrieNode(currCh);
        node = node.children[currCh];
      }
    }

    node.url = url;
    node.urlCompleted = true;
    this.length++;
  }

  constains(url) {
    let node = this.root;

    for (let i = 0; i < url.length; i++) {
      let currCh = url[i];
      if (node.children[currCh]) continue;
      else return false;
    }

    return true;
  }

  getAllUrls(node, suffix='', suffixes=[]) {
    if (!node) return;
    let allSuffixes = suffixes;

    for (let n in node.children) {
      let child = node.children[n];
      let currSuffix = suffix;
      currSuffix += suffix.value;
      if (child.completesUrl()) {
        allSuffixes.push(currSuffix);
      }
      this.getAllUrls(child, currSuffix, allSuffixes);
    }

    return allSuffixes;
  }
}

module.exports = { UrlTrie };