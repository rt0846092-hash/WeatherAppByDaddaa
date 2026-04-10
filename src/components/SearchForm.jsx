const SearchForm = ({searchInput, setSearchInput,handleSubmit}) =>{
    return(
        <form className = "InputForm" onSubmit = {handleSubmit}
        >
            <input 
            type = "text"
            value = {searchInput}
            onChange ={(e) => setSearchInput(e.target.value)}
            placeholder = "Enter a city..."
            className="search-input"
            />
            <button className = "citySearch" type = "submit">Search</button>
        </form>
    )
}

export default SearchForm;