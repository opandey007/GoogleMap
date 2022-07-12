var initialState = [];
const SeletedPlace = (state = {}, action) => {
  switch (action.type) {
    case 'SELECTED_PLACE':
      return action.payload;
      break;
    default:
      return state;
  }
};

export default SeletedPlace;
