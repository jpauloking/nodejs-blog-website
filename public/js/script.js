document.addEventListener('DOMContentLoaded', function (e) {
    const headerSearchButton = document.querySelector('.header__search-button');
    const search = document.querySelector('.search');
    const searchTerm = document.querySelector('#search-term');
    const searchClose = document.querySelector('#search-close');

    headerSearchButton.addEventListener('click', function (event) {
        search.style.visibility = 'visible';
        search.classList.add('open');
        this.setAttribute('aria-expanded', true);
        searchTerm.focus();
    });

    searchClose.addEventListener('click', function (event) {
        search.style.visibility = 'hidden';
        search.classList.remove('open');
        headerSearchButton.setAttribute('aria-expanded', false);
    });

})