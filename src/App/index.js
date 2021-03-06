import React, { Component } from 'react';
import './index.css';
import Button from "../Button";
import Table from "../Table";
import Search from "../Search";
import Intro from "../Intro";


const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const DEFAULT_HPP = '10';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);

  }

  needsToSearchTopStories(searchTerm) {
      return !this.state.results[searchTerm];
   }

   onSearchChange(event) {
      this.setState({ searchTerm: event.target.value });
   }

   onSearchSubmit(event) {
      const { searchTerm } = this.state;
      this.setState({ searchKey: searchTerm });
      if (this.needsToSearchTopStories(searchTerm)) {
         this.fetchSearchTopStories(searchTerm);
      }
      event.preventDefault();
   }

   fetchSearchTopStories(searchTerm, page = 0) {
      fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result))
      .catch(error => this.setState({ error }));
   }

   setSearchTopStories(result) {
      const { hits, page } = result;
      const { searchKey, results } = this.state;
      
      const oldHits = results && results[searchKey]
         ? results[searchKey].hits
         : [];

      const updatedHits = [
         ...oldHits,
         ...hits
      ];
      this.setState({
         results: {
            ...results,
            [searchKey]: { hits: updatedHits, page }
         }
      });
   }

   componentDidMount() {
      const { searchTerm } = this.state;
      this.setState({ searchKey: searchTerm });
      this.fetchSearchTopStories(searchTerm);
   }

   onDismiss(id) {
      const { searchKey, results } = this.state;
      const { page, hits } = results[searchKey];

      const isNotId = item => item.objectID !== id;
      const updatedHits = hits.filter(isNotId);
      this.setState({
         results: {
            ...results,
            [searchKey]: { hits: updatedHits, page }
            }
         });
   }

   render() {
      const {
         searchTerm,
         results,
         searchKey,
         error
         } = this.state;

      const page = (
         results &&
         results[searchKey] &&
         results[searchKey].page
      ) || 0;

      const list = (
         results &&
         results[searchKey] &&
         results[searchKey].hits
      ) || [];
         

      return (
         <div className="page">
            <div >
               <div className="page__intro-search">
                  <Intro/>
                  <Search
                     value={searchTerm}
                     onChange={this.onSearchChange}
                     onSubmit={this.onSearchSubmit}
                     >
                     Search
                  </Search>
               </div>
            </div>
            { error
               ? <div class="page__error">
                  <p>Something went wrong.</p>
               </div>
               : <Table
                  list={list}
                  onDismiss={this.onDismiss}
               />
            }
            <div className="page__button">
            <Button onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
                  View more
            </Button>
            </div>
         </div>
      
      );
   }
}

export default App;
