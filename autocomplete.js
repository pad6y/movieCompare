const createAutoComplete = ({
  root,
  renderOption,
  onOptionSelect,
  inputValue,
  fetchData,
}) => {
  root.innerHTML = `
  <label><b>Search</b></label>
  <input class="input" />
  <div class="dropdown">
    <div class="dropdown-menu">
      <div class="dropdown-content results"></div>
    </div>
  </div>
`;

  const input = root.querySelector('input');
  const dropdown = root.querySelector('.dropdown');
  const resultsWrapper = root.querySelector('.results');

  const onInput = async (evt) => {
    try {
      const items = await fetchData(evt.target.value);

      resultsWrapper.innerHTML = '';
      dropdown.classList.add('is-active');

      for (let item of items) {
        const option = document.createElement('a');

        option.classList.add('dropdown-item');
        option.innerHTML = renderOption(item);

        option.addEventListener('click', () => {
          dropdown.classList.remove('is-active');
          input.value = inputValue(item);

          onOptionSelect(item);
        });

        resultsWrapper.appendChild(option);
      }
    } catch (e) {
      const div = document.createElement('div');
      const existingDiv = document.querySelector('.error');

      if (input.value === '') {
        dropdown.classList.remove('is-active');
        root.removeChild(existingDiv);
        return;
      }

      div.classList.add('error');
      div.innerHTML = `<h1>${e.message}</h1>`;
      root.appendChild(div);
    }
  };

  input.addEventListener('input', debounce(onInput, 800));

  document.addEventListener('click', (event) => {
    if (!root.contains(event.target)) {
      dropdown.classList.remove('is-active');
    }
  });
};
