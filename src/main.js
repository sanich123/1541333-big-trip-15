import PriceTripView from './view/price-trip.js';
import NavigationView from './view/navigation.js';
// import NewWithoutDestination from './view/newWithoutDestination.js';
// import NewWithoutOffers from './view/new-without-offers.js';
// import NewPoint from './view/newPoint.js';
import { renderPosition, render, remove } from './utils/rendering-utils.js';
import PointsPresenter from './presenter/points-presenter.js';
import PointsModel from './model/points-model.js';
import DestinationsModel from './model/destinations-model.js';
import OffersModel from './model/offers-model.js';
import FiltersModel from './model/filters-model.js';
import FiltersPresenter from './presenter/filters-presenter.js';
import { MenuItem, UpdateType } from './utils/constants.js';
import StatisticsView from './view/statistics.js';
import Api from './api.js';

const AUTHORIZATION = 'Basic hD3sb8dfSWcl2sA5j';
const END_POINT = 'https://14.ecmascript.pages.academy/big-trip/';

const priceAndTripSection = document.querySelector('.trip-main');
const toNavigation = document.querySelector('.trip-controls__navigation');
const toFilters = document.querySelector('.trip-controls__filters');
const toSort = document.querySelector('.trip-events');
const toStat = document.querySelector('main.page-body__page-main .page-body__container');

const pointsModel = new PointsModel();
const destinationsModel = new DestinationsModel();
const offersModel = new OffersModel();
const filtersModel = new FiltersModel();
const api = new Api(END_POINT, AUTHORIZATION);

render(priceAndTripSection, new PriceTripView(pointsModel.getPoints()), renderPosition.AFTERBEGIN);
const navigationView = new NavigationView();
render(toNavigation, navigationView, renderPosition.AFTERBEGIN);

const pointsPresenter = new PointsPresenter(toSort, pointsModel, filtersModel, api, destinationsModel, offersModel);
const filterPresenter = new FiltersPresenter(toFilters, filtersModel, pointsModel);

let statisticsComponent = null;

const handleNavigationClick = (menuItem) => {
  switch (menuItem) {
    case MenuItem.POINTS:
      pointsPresenter.destroy();
      pointsPresenter.init();
      remove(statisticsComponent);
      statisticsComponent = null;
      navigationView.addClassItem(MenuItem.POINTS);
      navigationView.removeClassItem(MenuItem.STATISTICS);
      document.querySelector('.trip-main__event-add-btn').disabled = false;
      document.querySelectorAll('.trip-filters__filter-input').forEach((it) => it.disabled = false);
      break;
    case MenuItem.STATISTICS:
      if (statisticsComponent !== null) {
        return;
      }
      pointsPresenter.destroy();
      statisticsComponent = new StatisticsView(pointsModel.getPoints());
      render(toStat, statisticsComponent, renderPosition.AFTERBEGIN);
      navigationView.addClassItem(MenuItem.STATISTICS);
      navigationView.removeClassItem(MenuItem.POINTS);
      document.querySelector('.trip-main__event-add-btn').disabled = true;
      document.querySelectorAll('.trip-filters__filter-input').forEach((it) => it.disabled = true);
      break;
  }
};
navigationView.setMenuClickHandler(handleNavigationClick);

pointsPresenter.init();
filterPresenter.init();
api.getPoints().then((points) => {
  pointsModel.setPoints(UpdateType.INIT, points);
})
  .catch(() => {
    pointsModel.setPoints(UpdateType.INIT, []);
  });
api.getDestinations().then((destinations) => {
  destinationsModel.setDestinations(destinations);
});

api.getOffers().then((offers) => {
  offersModel.setOffers(offers);
});

document.querySelector('.trip-main__event-add-btn').addEventListener('click', (evt) => {
  evt.preventDefault();
  pointsPresenter.createPoint();
  document.querySelector('.trip-main__event-add-btn').disabled = true;
});
