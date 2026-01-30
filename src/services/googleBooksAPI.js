import axios from 'axios';

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

const GoogleBooksAPI = new (class GoogleBooksAPI {
  async searchBooks(query, maxResults = 20, startIndex = 0) {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          q: query,
          maxResults,
          startIndex,
          printType: 'books',
          orderBy: 'relevance'
        }
      });

      return {
        books: response.data.items?.map(this.formatBook) || [],
        totalItems: response.data.totalItems || 0
      };
    } catch (error) {
      console.error('Error searching books:', error);
      return { books: [], totalItems: 0 };
    }
  }

  async getBookById(id) {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return this.formatBook(response.data);
    } catch (error) {
      console.error('Error fetching book:', error);
      return null;
    }
  }

  async getBooksByCategory(category, maxResults = 20) {
    const categoryQueries = {
      fiction: 'subject:fiction -subject:comics -subject:manga',
      mystery: 'subject:mystery OR subject:detective -subject:comics',
      romance: 'subject:romance OR subject:"love story" -subject:comics',
      'science-fiction': 'subject:"science fiction" OR subject:sci-fi -subject:comics',
      fantasy: 'subject:fantasy -subject:comics -subject:manga',
      thriller: 'subject:thriller OR subject:suspense -subject:comics',
      historical: 'subject:"historical fiction" OR subject:history -subject:comics',
      adventure: 'subject:adventure OR subject:action -subject:comics -subject:manga',
      biography: 'subject:biography OR subject:memoir',
      'self-help': 'subject:"self help" OR subject:"personal development"',
      business: 'subject:business OR subject:economics',
      health: 'subject:health OR subject:fitness OR subject:wellness',
      cooking: 'subject:cooking OR subject:recipes OR subject:food',
      travel: 'subject:travel OR subject:guide',
      comics: 'subject:comics OR subject:"graphic novel"',
      manga: 'subject:manga OR subject:"japanese comics"',
      superhero: 'subject:superhero OR subject:"comic book" OR subject:"super hero"'
    };

    const query = categoryQueries[category] || `subject:${category}`;
    return this.searchBooks(query, maxResults);
  }

  async getTrendingBooks() {
    // Get trending books from multiple popular categories
    const queries = [
      'bestseller 2024 -subject:comics',
      'popular fiction 2024',
      'award winning books 2024',
      'new releases fiction',
      'bestselling novels'
    ];

    const allBooks = [];
    
    for (const query of queries) {
      const result = await this.searchBooks(query, 4);
      allBooks.push(...result.books);
    }

    // Remove duplicates and return top 20
    const uniqueBooks = allBooks.filter((book, index, self) => 
      index === self.findIndex(b => b.id === book.id)
    );

    return uniqueBooks.slice(0, 20);
  }

  async getBooksByMood(mood) {
    const moodQueries = {
      emotional: 'emotional OR heartwarming OR touching -subject:comics',
      dark: 'dark OR thriller OR mystery -subject:comics',
      hopeful: 'inspirational OR uplifting OR hope -subject:comics',
      adventurous: 'adventure OR action OR journey -subject:comics',
      romantic: 'romance OR "love story" -subject:comics',
      mysterious: 'mystery OR detective OR suspense -subject:comics'
    };

    const query = moodQueries[mood] || mood;
    return this.searchBooks(query, 12);
  }

  formatBook(item) {
    const volumeInfo = item.volumeInfo || {};
    const saleInfo = item.saleInfo || {};

    // Enhanced image URL handling with multiple fallbacks
    const getImageUrl = (imageLinks, size) => {
      if (!imageLinks) return '';
      
      const url = imageLinks[size] || imageLinks.thumbnail || imageLinks.smallThumbnail || '';
      if (url) {
        // Replace http with https and enhance image quality
        return url.replace('http:', 'https:')
                 .replace('&edge=curl', '')
                 .replace('zoom=1', 'zoom=2')
                 .replace('&source=gbs_api', '&source=gbs_api&fife=w400-h600');
      }
      return '';
    };

    return {
      id: item.id,
      title: volumeInfo.title || 'Unknown Title',
      authors: volumeInfo.authors || ['Unknown Author'],
      description: volumeInfo.description || 'No description available',
      publishedDate: volumeInfo.publishedDate || '',
      pageCount: volumeInfo.pageCount || 0,
      categories: volumeInfo.categories || [],
      averageRating: volumeInfo.averageRating || 0,
      ratingsCount: volumeInfo.ratingsCount || 0,
      imageLinks: {
        thumbnail: getImageUrl(volumeInfo.imageLinks, 'thumbnail'),
        small: getImageUrl(volumeInfo.imageLinks, 'small'),
        medium: getImageUrl(volumeInfo.imageLinks, 'medium'),
        large: getImageUrl(volumeInfo.imageLinks, 'large'),
        extraLarge: getImageUrl(volumeInfo.imageLinks, 'extraLarge')
      },
      language: volumeInfo.language || 'en',
      publisher: volumeInfo.publisher || '',
      isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || '',
      previewLink: volumeInfo.previewLink || '',
      infoLink: volumeInfo.infoLink || '',
      buyLink: saleInfo.buyLink || '',
      price: saleInfo.listPrice ? `${saleInfo.listPrice.amount} ${saleInfo.listPrice.currencyCode}` : 'Not for sale'
    };
  }

  // Comic-specific methods
  async getComicsByPublisher(publisher) {
    const publisherQueries = {
      marvel: 'marvel comics OR marvel universe OR spider-man OR avengers OR x-men',
      dc: 'dc comics OR batman OR superman OR wonder woman OR justice league',
      'dark-horse': 'dark horse comics OR hellboy OR sin city',
      image: 'image comics OR walking dead OR saga comic',
      manga: 'manga OR "japanese comics" OR naruto OR "one piece" OR "attack on titan"'
    };

    const query = publisherQueries[publisher] || `${publisher} comics`;
    return this.searchBooks(query, 15);
  }

  async getSuperheroComics() {
    const superheroQueries = [
      'batman comics',
      'superman comics', 
      'spider-man comics',
      'avengers comics',
      'justice league comics',
      'x-men comics'
    ];

    const allComics = [];
    
    for (const query of superheroQueries) {
      const result = await this.searchBooks(query, 3);
      allComics.push(...result.books);
    }

    return allComics.slice(0, 18);
  }

  // Popular books by category for home screen
  async getPopularBooksByCategory() {
    const categories = [
      { id: 'fiction', name: 'Popular Fiction' },
      { id: 'mystery', name: 'Mystery & Thriller' },
      { id: 'romance', name: 'Romance' },
      { id: 'fantasy', name: 'Fantasy' },
      { id: 'science-fiction', name: 'Science Fiction' },
      { id: 'biography', name: 'Biography' }
    ];

    const categoryBooks = {};
    
    for (const category of categories) {
      const result = await this.getBooksByCategory(category.id, 12);
      categoryBooks[category.id] = {
        name: category.name,
        books: result.books || []
      };
    }
    
    return categoryBooks;
  }

  // Get curated books with guaranteed cover images
  async getCuratedBooksByCategory(category) {
    const curatedQueries = {
      horror: [
        'Dracula Bram Stoker',
        'The Shining Stephen King',
        'It Stephen King',
        'The Haunting of Hill House Shirley Jackson',
        'Bird Box Josh Malerman'
      ],
      fiction: [
        'The Alchemist Paulo Coelho',
        'To Kill a Mockingbird Harper Lee',
        'The Kite Runner Khaled Hosseini',
        'Life of Pi Yann Martel',
        'The Old Man and the Sea Ernest Hemingway'
      ],
      mystery: [
        'Sherlock Holmes Hound of the Baskervilles Arthur Conan Doyle',
        'The Girl with the Dragon Tattoo Stieg Larsson',
        'Gone Girl Gillian Flynn',
        'The Da Vinci Code Dan Brown',
        'Murder on the Orient Express Agatha Christie'
      ],
      romance: [
        'Pride and Prejudice Jane Austen',
        'Me Before You Jojo Moyes',
        'The Notebook Nicholas Sparks',
        'It Ends With Us Colleen Hoover',
        'Love & Other Words Christina Lauren'
      ],
      'science-fiction': [
        'Dune Frank Herbert',
        '1984 George Orwell',
        'The Martian Andy Weir',
        'Enders Game Orson Scott Card',
        'Neuromancer William Gibson'
      ],
      fantasy: [
        'Harry Potter Sorcerers Stone J.K. Rowling',
        'The Lord of the Rings J.R.R. Tolkien',
        'A Song of Ice and Fire George R.R. Martin',
        'The Hobbit J.R.R. Tolkien',
        'The Name of the Wind Patrick Rothfuss'
      ],
      thriller: [
        'The Silent Patient Alex Michaelides',
        'The Girl on the Train Paula Hawkins',
        'Shutter Island Dennis Lehane',
        'The Bourne Identity Robert Ludlum',
        'The Da Vinci Code Dan Brown'
      ],
      historical: [
        'The Book Thief Markus Zusak',
        'War and Peace Leo Tolstoy',
        'All the Light We Cannot See Anthony Doerr',
        'The Pillars of the Earth Ken Follett',
        'The Nightingale Kristin Hannah'
      ],
      adventure: [
        'Treasure Island Robert Louis Stevenson',
        'The Call of the Wild Jack London',
        'Robinson Crusoe Daniel Defoe',
        'Life of Pi Yann Martel',
        'Into the Wild Jon Krakauer'
      ],
      comics: [
        'Watchmen Alan Moore',
        'Batman The Killing Joke Alan Moore',
        'Spider-Man Blue Jeph Loeb',
        'Sandman Neil Gaiman',
        'Maus Art Spiegelman'
      ]
    };

    const queries = curatedQueries[category] || [];
    const books = [];

    for (const query of queries) {
      try {
        const result = await this.searchBooks(query, 1);
        if (result.books && result.books.length > 0) {
          books.push(result.books[0]);
        }
      } catch (error) {
        console.warn(`Failed to fetch book: ${query}`);
      }
    }

    return books;
  }

  // Get curated comics with guaranteed cover images
  async getCuratedComicsByPublisher(publisher) {
    const curatedComics = {
      marvel: [
        'Amazing Spider-Man Marvel',
        'Avengers Marvel Comics',
        'X-Men Marvel Comics',
        'Iron Man Marvel Comics',
        'Captain America Marvel',
        'Thor Marvel Comics',
        'Guardians of the Galaxy Marvel',
        'Black Panther Marvel'
      ],
      dc: [
        'Batman DC Comics',
        'Superman DC Comics',
        'Wonder Woman DC Comics',
        'Justice League DC',
        'The Flash DC Comics',
        'Green Lantern DC Comics',
        'Aquaman DC Comics',
        'Harley Quinn DC'
      ],
      manga: [
        'Naruto manga',
        'One Piece manga',
        'Attack on Titan manga',
        'Dragon Ball manga',
        'Death Note manga',
        'My Hero Academia manga',
        'Demon Slayer manga',
        'One Punch Man manga'
      ],
      superhero: [
        'Watchmen Alan Moore',
        'Batman The Killing Joke Alan Moore',
        'Spider-Man Blue Jeph Loeb',
        'Sandman Neil Gaiman',
        'Maus Art Spiegelman',
        'Spider-Man comic',
        'Batman comic',
        'Superman comic'
      ]
    };

    const queries = curatedComics[publisher] || [];
    const comics = [];

    for (const query of queries) {
      try {
        const result = await this.searchBooks(query, 1);
        if (result.books && result.books.length > 0) {
          comics.push(result.books[0]);
        }
      } catch (error) {
        console.warn(`Failed to fetch comic: ${query}`);
      }
    }

    return comics;
  }
})();

export default GoogleBooksAPI;