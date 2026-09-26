const SearchForm = ({ searchInput, setSearchInput, handleSubmit, onLocate, locating }) => {
  return (
    <form className="InputForm" onSubmit={handleSubmit} role="search">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Enter a city..."
        className="search-input"
        aria-label="City name"
        autoComplete="off"
      />
      <button className="citySearch" type="submit">Search</button>
      <button
        className="locateBtn"
        type="button"
        onClick={onLocate}
        disabled={locating}
        aria-label="Use my location"
        title="Use my location"
      >
        {locating ? "…" : "📍"}
      </button>
    </form>
  );
};

export default SearchForm;
