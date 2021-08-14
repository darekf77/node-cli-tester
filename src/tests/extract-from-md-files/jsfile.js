import _ from 'lodash';
export default class oosVoalalaOrderChartsPageService {
  constructor($q, esCurrency, esMomentService) {
    this.$q = $q;
    this.esCurrency = esCurrency;
    this.esMomentService = esMomentService;
  }
}
