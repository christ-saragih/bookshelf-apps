const books = [];
const RENDER_EVENT = 'render-book';

document.addEventListener('DOMContentLoaded', function() {
    const inputBook = document.getElementById('inputBook');
    inputBook.addEventListener('submit', function(event) {
        event.preventDefault(); 
        addBook();
    });
    if (isStorageExist()) {
        loadDataFromStorage();
      }
});

function addBook() {
    const inputBookTitle = document.getElementById('inputBookTitle').value;
    const inputBookAuthor = document.getElementById('inputBookAuthor').value;
    const inputBookYear = document.getElementById('inputBookYear').value;
    const inputBookIsComplete = document.getElementById('inputBookIsComplete').checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, inputBookTitle, inputBookAuthor, inputBookYear, inputBookIsComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
  }

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

document.addEventListener(RENDER_EVENT, function () {
    // console.log(books);
    const uncompletedBookList = document.getElementById('uncompleteBookshelfList');
    uncompletedBookList.innerHTML = '';

    const completedBookList = document.getElementById('completeBookshelfList');
    completedBookList.innerHTML = '';
    
    for(const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if(!bookItem.isCompleted) {
            uncompletedBookList.append(bookElement);
        } else {
            completedBookList.append(bookElement);
        }
    }
});

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;
   
    const textAuthor = document.createElement('p');
    textAuthor.innerText = `Penulis: ${bookObject.author}`;

    const textYear = document.createElement('p');
    textYear.innerText = `Tahun: ${bookObject.year}`;
   
    const textContainer = document.createElement('div');
    textContainer.classList.add('book_item');
    textContainer.append(textTitle, textAuthor, textYear);
   
    const container = document.createElement('article');
    container.classList.add('book_container');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);

    if (bookObject.isCompleted) {
        const unfinishButton = document.createElement('button');
        unfinishButton.classList.add('green');
        unfinishButton.innerText = "Belum selesai dibaca";
     
        unfinishButton.addEventListener('click', function () {
          unfinishBookFromCompleted(bookObject.id);
        });
     
        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerText = "Hapus buku";
     
        trashButton.addEventListener('click', function () {
          removeBook(bookObject.id);
        });

        const actionContainer = document.createElement('div');
        actionContainer.classList.add('action');
        actionContainer.append(unfinishButton, trashButton);
     
        container.append(actionContainer);
      } else {
        const finishButton = document.createElement('button');
        finishButton.classList.add('green');
        finishButton.innerText = "Selesai dibaca";
     
        finishButton.addEventListener('click', function () {
          finishBookToCompleted(bookObject.id);
        });
     
        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerText = "Hapus buku";
     
        trashButton.addEventListener('click', function () {
          removeBook(bookObject.id);
        });

        const actionContainer = document.createElement('div');
        actionContainer.classList.add('action');
        actionContainer.append(finishButton, trashButton);
     
        container.append(actionContainer);
      }
   
    return container;
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
          return bookItem;
        }
      }
      return null;
}

function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);
   
    if (bookTarget === -1) return;
   
    const confirmation = confirm("Apakah Anda yakin menghapus item ini?");
    if (confirmation) {
        books.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
}

function unfinishBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);
   
    if (bookTarget == null) return;
   
    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function finishBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);
   
    if (bookTarget == null) return;
   
    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData(); 
}

function findBookIndex(bookId) {
    for (const index in books) {
      if (books[index].id === bookId) {
        return index;
      }
    }
   
    return -1;
}

function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
 
function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
   
    if (data !== null) {
      for (const book of data) {
        books.push(book);
      }
    }
   
    document.dispatchEvent(new Event(RENDER_EVENT));
}

const searchBook = document.getElementById('searchBook');
const searchBookTitle = document.getElementById('searchBookTitle');

searchBook.addEventListener('submit', function(event) {
    event.preventDefault();

    const query = searchBookTitle.value.toLowerCase().trim();
    const searchResults = books.filter(book => {
        return (
            book.title.toLowerCase().includes(query)
        );
    });

    updateSearchResults(searchResults);
});

function updateSearchResults(results) {
    const uncompletedBookList = document.getElementById('uncompleteBookshelfList');
    uncompletedBookList.innerHTML = '';

    const completedBookList = document.getElementById('completeBookshelfList');
    completedBookList.innerHTML = '';

    for(const book of results) {
        const bookItem = makeBook(book);
        if(book.isCompleted) {
            completedBookList.appendChild(bookItem);
        } else {
            uncompletedBookList.appendChild(bookItem);
        }
    }
}