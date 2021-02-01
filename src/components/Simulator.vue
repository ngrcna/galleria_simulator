<template>
  <div class="container-fluid">
    <div class="row fixed-top top border-bottom pt-2" ref="top">
      <div class="col-lg-4 col-md-12 col-sm-12 col-12 mb-1 form-group">
        <label>初期: </label>
        <select class="form-control-sm" v-model="firstFacetId">
          <option value="">----</option>
          <option v-for="(facet, idx) in facets" :key="idx" :value="facet.id">{{ facet.name }}</option>
        </select>
        <b-button class="btn-sm ml-2" @click="clickGoFirst">Go</b-button>
      </div>

      <div class="col-lg-4 col-md-12 col-sm-12 col-12 mb-1 form-group">
        <label>最終: </label>
        <select class="form-control-sm" v-model="lastFacetId">
          <option value="">----</option>
          <option v-for="(facet, idx) in facets" :key="idx" :value="facet.id">{{ facet.name }}</option>
        </select>
        <b-button class="btn-sm ml-2" @click="clickGoLast">Go</b-button>
      </div>

      <div class="col-lg-3 col-md-12 col-sm-12 col-12 mb-1 form-group">
        <p class="mb-1">
          コスト: <span :class="{'text-danger': totalCost > maxCost }">{{ totalCost }}</span> / <input type="text" class="form-control-sm" size="4" v-model.number="maxCost" />
          <b-button v-b-modal.modal1 class="btn-sm ml-2 mr-3">結果</b-button>
        </p>
      </div>
    </div>
    <div class="top-btn">
      <b-button v-b-modal.modal2 class="btn-sm mt-2 mr-2">説明</b-button>
    </div>

    <div class="row facet-wrapper">
      <div class="col-md-6 col-sm-12 col-12 mb-4" v-for="(facet, idx) in facets" :key="idx" :id="facet.id">
        <p class="facet-name">{{ facet.name }}</p>
        <table class="table table-bordered">
          <tr class="skill" v-for="(skill, idx2) in facet.skills" :key="`${idx}-${idx2}`" :class="{'bg-warning': skill.isChecked}">
            <td class="skill-check">
              <input type="checkbox" v-model="skill.isChecked" /><br />
              <template v-if="skill.isSpecial">
                <span class="text-danger">固</span>
              </template>
              <template v-else-if="skill.isCheckedSpecial">
                <span class="text-danger" :data-idx="idx" :data-idx2="idx2" @click="clickSkillSpecial">選</span>
              </template>
              <template v-else>
                <span class="text-secondary" :data-idx="idx" :data-idx2="idx2" @click="clickSkillSpecial">選</span>
              </template>
            </td>
            <td class="skill-name" :data-idx="idx" :data-idx2="idx2" @click="clickSkill">{{ skill.name }}</td>
            <td class="skill-desc" :data-idx="idx" :data-idx2="idx2" @click="clickSkill">{{ skill.desc }}</td>
            <td class="skill-cost" :data-idx="idx" :data-idx2="idx2" @click="clickSkillSpecial">{{ skill.cost }}</td>
            <td class="skill-cost" :data-idx="idx" :data-idx2="idx2" @click="clickSkillSpecial">
              <template v-if="skill.isSpecial && lastFacet !== null && facet.type == lastFacet.type">
                0
              </template>
              <template v-else-if="skill.isCheckedSpecial && lastFacet !== null && facet.id == lastFacet.id">
                0
              </template>
              <template v-else-if="firstFacet !== null && facet.id === firstFacet.id">
                {{ skill.firstCost }}
              </template>
              <template v-else-if="lastFacet !== null && facet.type == lastFacet.type">
                {{ skill.lastCost }}
              </template>
              <template v-else>
                {{ skill.cost }}
              </template>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <b-modal id="modal1" title="結果" hide-footer>
      <textarea readonly class="form-control-sm h-100 w-100" v-model="modalText"></textarea>
    </b-modal>

    <b-modal id="modal2" title="説明" hide-footer>
      <ul>
        <li class="mb-2">ガレリアの地下迷宮と魔女ノ旅団のスキルコスト計算機です。</li>
        <li class="mb-2">スキル表の一番右の項目は、初期ファセット・最終ファセットにより割引されたスキルコストです。<br />※右から2つ目は元々のスキルコストです。</li>
        <li class="mb-2">
          セットするスキルにチェックを入れると、合計コストが上部に表示されます。<br />
          ※スキル名・説明をクリックでもチェックできます。
        </li>
        <li class="mb-2">「固」は固有スキルです。</li>
        <li class="mb-2">
          「選」は選択スキルです。クリックすると、選択スキル扱いになり、最終ファセットでのコストが0になります。<br />
          ※スキルコストをクリックでも設定できます。<br />
          ※最終ファセット以外にも設定できます。
        </li>
        <li class="mb-2">上部の結果ボタンを押すと、計算結果のまとめ(？)を確認できます。</li>
        <li class="mb-2">
          スキルデータの表記など、<a href="https://www.spoiler.jp/game/galleria/" target="_blank">spoiler</a> 様を参考にさせていただきました。<br />
          いつも攻略情報でお世話になっております。大いなる感謝を。
        </li>
      </ul>
    </b-modal>
  </div>
</template>

<script>
const Skill = class {
  constructor(name, cost, desc, isSpecial) {
    this.name = name;
    this.cost = cost;
    this.firstCost = Math.ceil(cost / 4);
    this.lastCost = Math.ceil(cost / 3);
    this.desc = desc;
    this.isSpecial = isSpecial;
    this.isChecked = false;
    this.isCheckedSpecial = false;
  }
};

const Facet = class {
  constructor(id, type, name, skills) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.skills = skills;
  }
};

export default {
  name: 'Simulator',
  data: function () {
    return {
      maxCost: 268,
      firstFacetId: '',
      lastFacetId: '',
      facets: [
        new Facet(
          'aster_1',
          'aster',
          'アステルクロウ',
          [
            new Skill(
              'スターバースト',
              50,
              '【戦闘中】\n旅団のアタッカーが自分のみなら攻撃力+75%',
              true
            ),
            new Skill(
              '不屈の精神',
              50,
              '【戦闘中1回】\n死亡ダメージを受けた際、HPが1残る',
              true
            ),
            new Skill(
              '古塔乱',
              25,
              '【装備古塔槍】【攻撃時】\n与クリティカル値+50',
              false
            ),
            new Skill(
              '運命の星',
              25,
              '【常時】\n運命力（LUC）が大幅にアップ',
              false
            ),
            new Skill(
              '驚愕治癒術',
              5,
              '【常時】\n驚愕状態の自然回復速度アップ',
              false
            ),
            new Skill(
              'ハイギアI',
              12,
              '【HP50%以上】\n行動速度小アップ',
              false
            ),
            new Skill(
              'ラッキーパンチ',
              10,
              '【LUC幸運以上】\n反撃発動時のダメージ+50%',
              false
            ),
            new Skill(
              '煌めく運勢',
              18,
              '【配置：アタッカー】【ターン毎】【最大33ターン】\n運命力が小アップ\n戦闘不能になるとリセット',
              false
            ),
            new Skill(
              '貫撃耐性強化術',
              10,
              '【常時】\n貫撃耐性+15',
              false
            ),
            new Skill(
              'ハイギアII',
              14,
              '【HP50%以上】\nガード率+5%',
              false
            ),
            new Skill(
              '大火事場力',
              13,
              '【HP1%以下】\n与スタン値+2400',
              false
            ),
            new Skill(
              '古塔槍術師範',
              15,
              '【常時】\n古塔槍のウェポンマスタリーを4段階強化',
              false
            ),
            new Skill(
              '背水の速術',
              15,
              '【配置：前衛】【HP10%以下】\n行動速度大アップ',
              false
            ),
            new Skill(
              'ヒーロー',
              14,
              '【戦闘中】【装備マスタリーS+/武器】\n友好度の増減量が1.5倍',
              false
            ),
            new Skill(
              'ハイギアIII',
              8,
              '【HP50%以上】\n命中+10%',
              false
            ),
          ],
        ),
        new Facet(
          'aster_2',
          'aster',
          'アステルアーシェ',
          [
            new Skill(
              '蝕杖打撃術',
              50,
              '【装備：蝕杖】\n蝕杖の攻撃力が2倍になる',
              true
            ),
            new Skill(
              '不動の精神',
              50,
              '【ターン毎】\nHPが5%回復する',
              true
            ),
            new Skill(
              'ヘビースマッシュ',
              13,
              '【装備：蝕杖】\n与スタン値+1000、行動速度が小ダウン',
              false
            ),
            new Skill(
              '私怨ノ首食ミ',
              24,
              '【戦闘不能時】\n戦闘不能にさせた対象に深淵を確率100%で付加\nただし、自身の頭部をロストする',
              false
            ),
            new Skill(
              '緊急再生法術',
              10,
              '【習得】\n回復系ドナム「緊急再生法術」を習得する',
              false
            ),
            new Skill(
              '星の意思',
              23,
              '【常時】\n不意を突かれた際の驚愕耐性+35\n常時驚愕耐性+20、驚愕状態の自然回復速度がアップ',
              false
            ),
            new Skill(
              '星の心',
              4,
              '【常時】\n不意を突かれた際の驚愕耐性+50',
              false
            ),
            new Skill(
              '蝕杖術師範',
              15,
              '【常時】\n蝕杖のウェポンマスタリーを4段階強化',
              false
            ),
            new Skill(
              '鉄壁運勢の極意',
              27,
              '【LUC幸運以上】\nガード率+15%',
              false
            ),
            new Skill(
              '蝕杖格闘理論',
              26,
              '【装備：蝕杖】【攻撃時】\n対象の防御力を30%無視する',
              false
            ),
            new Skill(
              '追撃強化の心得',
              12,
              '【配置：サポーター】【配置：追撃枠】\n追撃率+10%、追撃ダメージ+20%',
              false
            ),
            new Skill(
              '打撃耐性強化術',
              10,
              '【常時】\n打撃属性耐性+15',
              false
            ),
            new Skill(
              '星めぐり',
              70,
              '【常時】\n行動速度が特大アップ',
              false
            ),
            new Skill(
              '鎧通し',
              20,
              '【攻撃時】\n対象の防御力を15%無視する',
              false
            ),
            new Skill(
              '驚愕耐性強化術',
              10,
              '【常時】\n驚愕耐性+25',
              false
            ),
          ],
        ),
        new Facet(
          'shino_1',
          'shino',
          'シノマシラ',
          [
            new Skill(
              'マシラ乱打撃',
              50,
              '【装備マスタリーS/鈍器】【攻撃時】\n25%の確率で2-3回攻撃になる',
              true
            ),
            new Skill(
              '二刀一流',
              50,
              '【装備マスタリーS+/片手武器を両手】【攻撃時】\n75%の確率で両手の武器で攻撃する',
              true
            ),
            new Skill(
              '紫錆ビノ呪イ',
              50,
              '【戦闘中1回】【戦闘不能になった敵の攻撃】【重複あり】\n戦闘不能にさせた対象の攻撃力-20%\n効果は3ターン続く',
              false
            ),
            new Skill(
              '呪い返し',
              16,
              '【攻撃ヒット時】\n自身が状態異常時、同じ状態異常を威力100で付加',
              false
            ),
            new Skill(
              '猿メンチ',
              36,
              '【攻撃ヒット時】\n対象の敵から非常に狙われやすくなる',
              false
            ),
            new Skill(
              '呪毒の知識',
              15,
              '【常時】\n呪毒状態の自然回復速度アップ、呪毒耐性+20',
              false
            ),
            new Skill(
              '呪毒治癒術',
              5,
              '【常時】\n呪毒状態の自然回復速度アップ',
              false
            ),
            new Skill(
              '鈍槌術師範',
              15,
              '【常時】\n鈍槌のウェポンマスタリーを4段階強化',
              false
            ),
            new Skill(
              '肉体改造',
              15,
              '【同系あり】\nCON+50%、主に防御力に影響',
              false
            ),
            new Skill(
              'マシラ呪毒法',
              20,
              '【攻撃時】\n自身が呪毒状態なら、攻撃力+100%',
              false
            ),
            new Skill(
              '呪毒耐性強化術',
              10,
              '【常時】\n呪毒耐性+25',
              false
            ),
            new Skill(
              '猿叫',
              2,
              '【防御時 / 防御陣時】\n敵から少し狙われやすくなる',
              false
            ),
            new Skill(
              '鍛冶師の大技',
              35,
              '【攻撃時】\n攻撃力+35%',
              false
            ),
            new Skill(
              '三十六計逃ゲシカ',
              20,
              '【重複あり】\n逃走時、所属カヴンの逃走成功率+20%',
              false
            ),
            new Skill(
              '絶華一刀一ノ太刀',
              40,
              '【防御時 / 防御陣時】\n次ターンの攻撃力+100%',
              false
            ),
          ],
        ),
        new Facet(
          'shino_2',
          'shino',
          'シノブシ',
          [
            new Skill(
              '闇の残滓',
              50,
              '【配置：前衛】【HP100%】\n攻撃を受ける際、50%の確率で特殊回避\n回避が発動しない場合は被ダメージ3.5倍',
              true
            ),
            new Skill(
              '絶華二刀・極み',
              50,
              '【装備マスタリーS+ / 片手武器を両手】【HP75%以上】【攻撃時】\n両手の武器で攻撃する',
              true
            ),
            new Skill(
              '忍裸体術',
              38,
              '【同系あり】【戦闘中】【盾を含む防具を一切装備しない】\n回避力が5倍\n装飾品は除く、部位のロスト状態を考慮しない',
              false
            ),
            new Skill(
              '斬術',
              10,
              '【HP10%以下】【格下への攻撃時】\nクリティカル時のゴア率がアップ',
              false
            ),
            new Skill(
              'シャドウダッジ',
              10,
              '【習得】\n回避率を強化するドナム「シャドウダッジ」を習得する',
              false
            ),
            new Skill(
              '影術',
              15,
              '【戦闘中】\n敵から狙われにくくなる',
              false
            ),
            new Skill(
              '闇討ち術',
              15,
              '【同系あり】【スタン中の敵への攻撃時】\n与クリティカル値+75',
              false
            ),
            new Skill(
              '逃走経路確保',
              5,
              '【重複あり】\n所属カヴンが逃走する際の逃走成功率+5%\nアタッカー、サポーター関係なく人数分カウントされる',
              false
            ),
            new Skill(
              '戦場合気術',
              6,
              '【防御時 / 防御陣時】\n攻撃を受ける際、反撃確率+20%',
              false
            ),
            new Skill(
              '暗剣',
              12,
              '【配置：後衛】【攻撃時】\n敵から狙われる確率が上がりづらい',
              false
            ),
            new Skill(
              '刃落とし',
              13,
              '【HP100%】\n攻撃を受ける際の敵の攻撃力-20%',
              false
            ),
            new Skill(
              'シャドウアバター',
              10,
              '【習得】\n敵から狙われやすくなるドナム「シャドウアバター」を習得する',
              false
            ),
            new Skill(
              '影隠れ',
              6,
              '【HP10%以下】\n敵から非常に狙われにくくなる。',
              false
            ),
            new Skill(
              '絶華一刀・散花',
              63,
              '【装備マスタリーS+ / 片手斬撃】【未行動の敵への攻撃時】\n50%の確率で2-3回攻撃になる\n単体攻撃に限る、対象の敵は激怒しづらい',
              false
            ),
            new Skill(
              '刀剣術師範',
              15,
              '【常時】\n刀剣のウェポンマスタリーを4段階強化',
              false
            ),
          ],
        ),
        new Facet(
          'theater_1',
          'theater',
          'シアトリカルスター',
          [
            new Skill(
              '癒しの舞',
              50,
              '【装備：呪鐘】【重複あり】\nアタッカーなら両隣のHPを毎ターン3%回復、戦闘終了時15%回復\nサポーターなら所属カヴンのアタッカーのHPを毎ターン1%回復',
              true
            ),
            new Skill(
              'フレーフレーチア',
              50,
              '【装備：呪鐘】\n隣に配置された人形兵の回避力+50%\n与クリティカル値+25',
              true
            ),
            new Skill(
              '演者の意地',
              48,
              '【攻撃ミス時】【最大400%】\n攻撃力と命中力+50%\n攻撃がヒットしたらリセット',
              false
            ),
            new Skill(
              'ボディタッチ',
              14,
              '【HP100%】【攻撃ヒット時】\n25%の確率で錯乱効果を付加する',
              false
            ),
            new Skill(
              'レッドフェイス',
              20,
              '【攻撃ミス時】【最大100%】\n攻撃力+100%、攻撃がヒットしたらリセット',
              false
            ),
            new Skill(
              'スキキライスキ',
              20,
              '【同系あり】【戦闘中】\n他者からの友好度の増減量が2倍\n他者への増減量が0.5倍',
              false
            ),
            new Skill(
              '戦闘応援の舞',
              10,
              '【習得】\n攻撃力を強化するドナム「戦闘応援の舞」を習得する',
              false
            ),
            new Skill(
              'クールスマイル',
              2,
              '【防御時 / 防御陣時】\n敵から少し狙われにくくなる',
              false
            ),
            new Skill(
              '幻覚治癒術',
              5,
              '【常時】\n幻覚状態の自然回復速度アップ',
              false
            ),
            new Skill(
              '演者の身だしなみ',
              36,
              '【常時】\n幻覚、錯乱、腐臭、驚愕の耐性値+20',
              false
            ),
            new Skill(
              '呪鐘術師範',
              15,
              '【常時】\n呪鐘のウェポンマスタリーを4段階強化',
              false
            ),
            new Skill(
              '自己陶酔',
              19,
              '【装備：呪鐘】【戦闘終了時】\n自身のHPを10%回復',
              false
            ),
            new Skill(
              'チャーミング',
              5,
              '【同系あり】\nERS+15%、主に敵のターゲット選択に影響',
              false
            ),
            new Skill(
              '花ノ円舞曲',
              13,
              '【同系あり】【回避時】【最大400%】\nERS+30%、攻撃を受けたらリセット',
              false
            ),
            new Skill(
              'カーテンコール',
              50,
              '【戦闘中1回】\n死亡ダメージを受けた際、HPが1残る',
              false
            ),
          ],
        ),
        new Facet(
          'theater_2',
          'theater',
          'シアトリカルドルチェ',
          [
            new Skill(
              '癒演舞の鐘',
              50,
              '【装備：呪鐘】\nターン終了時、HPが3%回復、戦闘終了時は20%回復',
              true
            ),
            new Skill(
              'エロティカ',
              50,
              '【配置：アタッカー】【HP100%】\n攻撃時の計算にERSの値を使用する\nこの攻撃によって敵は激怒状態になりづらい\nただし、敵が悪性の場合は激怒しやすくなる',
              true
            ),
            new Skill(
              '魅惑のチア',
              4,
              '【HP100%】\n隣に配置された人形兵の行動速度が小アップ',
              false
            ),
            new Skill(
              '投げキッスの応援',
              39,
              '【配置：サポーター】【ターン終了時】【重複あり】\n所属カヴンのアタッカーのHPを3%回復',
              false
            ),
            new Skill(
              '過剰演出',
              20,
              '【同系あり】\n攻撃を受ける際、パワーソース増加量+50%',
              false
            ),
            new Skill(
              'スキキライ',
              20,
              '【戦闘中】\n他者への友好度の増減量が2倍になる',
              false
            ),
            new Skill(
              '食べごろドルチェ',
              10,
              '【習得】\n攻撃力とスタン値を強化するドナム「食べごろドルチェ」を習得',
              false
            ),
            new Skill(
              'ファニースマイル',
              6,
              '【防御時 / 防御陣時】\n敵から狙われている時、さらに狙われやすくなる',
              false
            ),
            new Skill(
              '幻覚耐性強化術',
              10,
              '【常時】\n幻覚耐性+25',
              false
            ),
            new Skill(
              'スィーツチャージ',
              10,
              '【習得】\nスタン値を回復するドナム「スィーツチャージ」を習得する',
              false
            ),
            new Skill(
              '美体自慢',
              10,
              '【同系あり】\nERS+35%',
              false
            ),
            new Skill(
              '詛呪の鐘',
              15,
              '【装備：呪鐘】\n共振率がアップし、敵から狙われやすくなる',
              false
            ),
            new Skill(
              '霧撃耐性強化術',
              10,
              '【常時】\n霧撃属性耐性+15',
              false
            ),
            new Skill(
              'ニップルスリップ',
              20,
              '【同系あり】【回避時】【最大150%】\nERS+50%、攻撃を受けたらリセット',
              false
            ),
            new Skill(
              'ローズドルチェ',
              40,
              '【同系あり】【回避時】【最大300%】\nERS+100%、攻撃を受けたらリセット',
              false
            ),
          ],
        ),
        new Facet(
          'pia_1',
          'pia',
          'ピアフォートレス',
          [
            new Skill(
              '守るの心',
              50,
              '【戦闘中】\n旅団内アタッカーが攻撃を受ける際10%の確率でかばう\n戦術甲装備一つにつき確率+8%',
              true
            ),
            new Skill(
              'ハイメガバッシュ',
              50,
              '【装備：戦術甲】【防御時 / 防御陣時】\n攻撃を受けた次の攻撃の与スタン値がアップ\n攻撃を受けた回数×800アップ、攻撃したらリセット',
              true
            ),
            new Skill(
              '篭城盾',
              20,
              '【防御時 / 防御陣時】\nHPを5%回復',
              false
            ),
            new Skill(
              '亀甲の構え',
              12,
              '【同系あり】【防御時 / 防御陣時】【最大150%】\n防御、防御陣によって防御力アップ\n連続して行った防御、防御陣のターン数×5%防御アップ',
              false
            ),
            new Skill(
              '鉄壁',
              30,
              '【同系あり】\nガード率+10%',
              false
            ),
            new Skill(
              'フィジカル自慢',
              10,
              '【同系あり】\nCON+35%、主に防御力に影響',
              false
            ),
            new Skill(
              '要塞門番の証',
              10,
              '【習得】\n挑発して敵を引き付けるドナム「要塞門番の証」を習得する',
              false
            ),
            new Skill(
              'コントラバッシュ',
              38,
              '【装備マスタリーS+/戦術甲】【防御時 / 防御陣時】\n武器射程が適正で物理攻撃をガード時に75%で反撃\n反撃ダメージは50%、与スタン値+2600、反撃発動は1回まで',
              false
            ),
            new Skill(
              '大鉄壁',
              45,
              '【同系あり】\nガード率+15%',
              false
            ),
            new Skill(
              '斬撃耐性強化術',
              10,
              '【常時】\n斬撃耐性+15',
              false
            ),
            new Skill(
              '腐臭耐性強化術',
              10,
              '【常時】\n腐臭耐性+25',
              false
            ),
            new Skill(
              '硬術',
              5,
              '【HP80%以上】\n防御力+10%',
              false
            ),
            new Skill(
              '戦術甲術師範',
              15,
              '【常時】\n戦術甲のウェポンマスタリーを4段階強化',
              false
            ),
            new Skill(
              'しんがり',
              10,
              '【戦闘中】\n旅団内で最後に行動する',
              false
            ),
            new Skill(
              '隠れた人気者',
              15,
              '【同系あり】【戦闘中】\n他者からの友好度の増減量が1.5倍',
              false
            ),
          ],
        ),
        new Facet(
          'pia_2',
          'pia',
          'ピアチャリオット',
          [
            new Skill(
              '守るの気概',
              50,
              '【戦闘中】\n所属カヴンのアタッカーが攻撃を受ける際10%の確率で肩代わり\n戦術甲装備1つにつき確率+15%',
              true
            ),
            new Skill(
              'マッドチャージ',
              50,
              '【配置：前衛】【防御時 / 防御陣時】\n次ターンの与クリティカル値+125\n攻撃を受けると反撃する\n反撃ダメージは60%、反撃応酬は1回まで',
              true
            ),
            new Skill(
              '鉄の構え',
              43,
              '【同系あり】【防御時 / 防御陣時】【最大200%】\n防御、防御陣によって防御力アップ\n連続して防御を行ったターン×30%防御力アップ',
              false
            ),
            new Skill(
              'コントラアタック',
              18,
              '【装備マスタリーA+ / 古塔槍（利き手）＋戦術甲】\n【防御時 / 防御陣時】\n物理攻撃を受ける際、25%の確率で反撃する\n反撃ダメージは100%、与クリティカル値+50、反撃応酬は1回まで',
              false
            ),
            new Skill(
              '腐臭治癒術',
              5,
              '【常時】\n腐臭状態の自然回復速度がアップ',
              false
            ),
            new Skill(
              'マゾヒスティック',
              21,
              '【戦闘中】\n攻撃を受ける際の防御力+35%',
              false
            ),
            new Skill(
              '必殺撃',
              15,
              '【防御時 / 防御陣時】\n次ターンの攻撃時、対象が瀕死かつ格下なら\nクリティカル時にクリティカル・ゴアになる',
              false
            ),
            new Skill(
              'ビッグホーン',
              10,
              '【習得】\n敵に状態異常を付与するドナム「ビッグホーン」を習得する',
              false
            ),
            new Skill(
              '焔撃耐性強化術',
              10,
              '【常時】\n焔撃属性耐性+15',
              false
            ),
            new Skill(
              '受身流し',
              18,
              '【戦闘中】\n”かばう”際の被ダメージ-50%',
              false
            ),
            new Skill(
              '絶対防衛術',
              42,
              '【HP100%】\nガード率+20%',
              false
            ),
            new Skill(
              '見果てぬ夢',
              11,
              '【同系あり】【戦闘中1回】【戦闘不能時】\n所属カヴンのアタッカーのHPを10%回復\n自身は含めない',
              false
            ),
            new Skill(
              '筋肉解放',
              10,
              '【常時】\n最大HP+50%、行動速度が大ダウン\n戦闘以外でも有効',
              false
            ),
            new Skill(
              'バトルマニア',
              25,
              '【配置：前衛】【HP80%以上】\n攻撃を受ける際、5%の確率で特殊回避\n回避が発動しない場合は被ダメージが-20%',
              false
            ),
            new Skill(
              'メガバッシュ',
              8,
              '【攻撃時：戦術甲】【防御時 / 防御陣時】\n攻撃を受けた次ターンの与スタン値+800',
              false
            ),
          ],
        ),
        new Facet(
          'wonder_1',
          'wonder',
          'ワンダーコルセア',
          [
            new Skill(
              '傭兵の掟',
              50,
              '【配置：サポーター】\n所属カヴンのアタッカーが攻撃で戦闘不能になった際に交代する\n戦闘不能になったアタッカーがスキルで蘇生する場合は発動しない',
              true
            ),
            new Skill(
              '盟友との誓い',
              50,
              '【戦闘中】\nその戦闘中の戦闘不能者数に応じて、攻撃回数が変化\n攻撃回数がランダムに増加、ただし、攻撃毎にHPを3%消費',
              true
            ),
            new Skill(
              '傭兵ギルドの盟約',
              11,
              '【ターン毎1回】\n旅団内アタッカーが攻撃を受ける際20%の確率でかばう',
              false
            ),
            new Skill(
              '天啓の見切り',
              18,
              '【HP100%】\n攻撃を受ける際、敵の攻撃力-30%',
              false
            ),
            new Skill(
              'マスタークラス',
              38,
              '【同系あり】\n10種のマスタリーがすべて2段階強化される',
              false
            ),
            new Skill(
              '勇気の心得',
              10,
              '【習得】\n味方をかばうドナム「勇気の心得」を習得',
              false
            ),
            new Skill(
              '傭兵の知恵',
              22,
              '【戦闘中1回 / HP10%以下 / ターン終了時】\nHPを15%回復',
              false
            ),
            new Skill(
              '戦術防衛',
              30,
              '【装備：戦術甲 or 盾】\n所属カヴンのアタッカーが攻撃を受ける際、16%の確率で肩代わり',
              false
            ),
            new Skill(
              '大足払い',
              31,
              '【同系あり】\n与スタン値+1200',
              false
            ),
            new Skill(
              'ローンレンジャー',
              29,
              '【戦闘中】\n同一ファセット(性別は無視)が旅団内のアタッカーにいないなら\n攻撃力、防御力、回避力、命中力+25%',
              false
            ),
            new Skill(
              '武芸百般',
              58,
              '【同系あり】\n10種のマスタリーが全て3段階強化される',
              false
            ),
            new Skill(
              'フンバ力',
              15,
              '【同系あり】\nスタン耐性値+2400',
              false
            ),
            new Skill(
              '因果律・攻',
              20,
              '【攻撃時】\n1%の確率でクリティカルとなる\n対象が格下ならクリティカル・ゴアになる確率もアップ',
              false
            ),
            new Skill(
              'ハニーポット',
              17,
              '【装備マスタリーS+/両手武器】\n武器射程が適正で攻撃を受ける際35%の確率で反撃\n反撃は命中率が激減、反撃応酬は3回まで',
              false
            ),
            new Skill(
              'サディスティック',
              10,
              '【攻撃クリティカル時】\n与えたダメージの5%分自身のHPを回復',
              false
            ),
          ],
        ),
        new Facet(
          'wonder_2',
          'wonder',
          'ワンダーヴィアンデ',
          [
            new Skill(
              'ラストスタンド',
              50,
              '【戦闘中】\n戦闘不能のアタッカーの数に応じて、与クリティカル値アップ',
              true
            ),
            new Skill(
              '鉄下駄',
              50,
              '【同系あり】【戦闘終了時】\n自身の獲得経験値+15%、行動速度がダウン',
              true
            ),
            new Skill(
              '急所突き',
              15,
              '【装備：雷技】【攻撃時】\n可能であれば70%の確率でジャストキルになる',
              false
            ),
            new Skill(
              'エグり込み',
              11,
              '【同系あり】【装備：雷技】【攻撃時】\n対象の防御力を10%無視する',
              false
            ),
            new Skill(
              '超体幹バランス',
              29,
              '【配置：アタッカー】【HP70%以上】【攻撃時】\n与スタン値+1600、スタン耐性値+800',
              false
            ),
            new Skill(
              'テイクダウン',
              19,
              '【配置：前衛】【装備マスタリーS+：雷技】\n【行動待機中の敵への攻撃時】\n与スタン値+1200',
              false
            ),
            new Skill(
              'ウォームアップ',
              8,
              '【配置：前衛】【HP80%以下】\n行動速度が小アップ',
              false
            ),
            new Skill(
              'オモプラッタ',
              59,
              '【スタン中の敵への攻撃時】\n2回攻撃になる',
              false
            ),
            new Skill(
              'ボコボコラッシュ',
              41,
              '【スタン中の敵への攻撃時】\n15%の確率で5-8回攻撃になる',
              false
            ),
            new Skill(
              'パンプアップ',
              36,
              '【戦闘中】\n攻撃を受ける度に防御力+25%、最大75%まで上昇',
              false
            ),
            new Skill(
              '反撃の挽歌',
              10,
              '【戦闘中】\n攻撃を受ける際、パワーソース増加量+25%',
              false
            ),
            new Skill(
              '自己鍛錬',
              51,
              '【同系あり】【戦闘終了時】\n自身の獲得経験値+20%、行動速度は常時大ダウン',
              false
            ),
            new Skill(
              '雷技術師範',
              10,
              '【常時】\n雷技のウェポンマスタリーを2-3段階強化',
              false
            ),
            new Skill(
              '超回復力',
              56,
              '【戦闘中】\n自身が蘇生した際のHP回復量+30%',
              false
            ),
            new Skill(
              '荒行',
              53,
              '【同系あり】【戦闘終了時】\n自身の獲得経験値+25%、行動速度は常時特大ダウン',
              false
            ),
          ],
        ),
        new Facet(
          'rapid_1',
          'rapid',
          'ラピッドヴェネター',
          [
            new Skill(
              '蘇生処置',
              50,
              '【戦闘中1回】【配置：サポーター】\n所属カヴンのアタッカーが戦闘不能になった際、自動で蘇生する\n蘇生には所持している蘇生アイテムを使用する',
              true
            ),
            new Skill(
              '先ノ先',
              50,
              '【常時】\n行動順番が1キャラ分早くなる',
              true
            ),
            new Skill(
              '狩猟の心得',
              10,
              '【攻撃で敵を撃破】\n対象の肉ドロップ確率+10%\nドナムによる攻撃では発動しない',
              false
            ),
            new Skill(
              '気配消し',
              3,
              '【配置：後衛】【ターン終了時】\n敵から少しずつ狙われにくくなる',
              false
            ),
            new Skill(
              '百花ノ狙撃手',
              14,
              '【攻撃時：百花弓】\n行動速度がアップ、命中力+25%',
              false
            ),
            new Skill(
              'ラピッドブースト',
              10,
              '【習得】\n行動速度を強化するドナム「ラピッドブースト」を習得',
              false
            ),
            new Skill(
              '錯乱治癒術',
              5,
              '【常時】\n錯乱状態の自然回復速度アップ',
              false
            ),
            new Skill(
              '反撃の狼煙',
              8,
              '【HP30%以下】【攻撃時】\n共振率が大アップ',
              false
            ),
            new Skill(
              'ミラクルガード',
              14,
              '【LUC：幸運中の幸運】\nガード率+15%',
              false
            ),
            new Skill(
              'イーグルアイ',
              10,
              '【習得】\n命中率を強化するドナム「イーグルアイ」を習得',
              false
            ),
            new Skill(
              '後ノ先',
              9,
              '【防御時 / 防御陣時】\n攻撃を受ける際、反撃確率+30%',
              false
            ),
            new Skill(
              '自然治癒力',
              65,
              '【配置：サポーター】【ターン終了時】\nHPを5%回復',
              false
            ),
            new Skill(
              'セックスアピール',
              10,
              '【戦闘中】【ターン毎】【最大16ターン】\n敵から非常に狙われやすくなる',
              false
            ),
            new Skill(
              '錯乱耐性強化術',
              10,
              '【常時】\n錯乱耐性+25',
              false
            ),
            new Skill(
              '百花弓術師範',
              15,
              '【常時】\n百花弓のウェポンマスタリーを4段階強化',
              false
            ),
          ],
        ),
        new Facet(
          'rapid_2',
          'rapid',
          'ラピッドラプター',
          [
            new Skill(
              'アヴォイダンス',
              50,
              '【同系あり】【回避時】【最大500%】\n攻撃力+50%、攻撃を受けたらリセット',
              true
            ),
            new Skill(
              '百花の乱れ矢',
              50,
              '【配置：後衛】【装備：百花弓】【攻撃時】\n3%の確率で10回攻撃になる\nただし、攻撃対象は敵グループとなる',
              true
            ),
            new Skill(
              'ハイゾーン',
              27,
              '【配置：後衛】【ターン毎】\n命中力+10%、与クリティカル値+5\n最大クリティカル+300%、命中力+300%\n攻撃を受けたらリセットされる',
              false
            ),
            new Skill(
              '速攻術',
              30,
              '【常時】\n行動速度が大アップ',
              false
            ),
            new Skill(
              'ハンティングアイ',
              12,
              '【配置：後衛】【HP30%以上】\n命中力+30%',
              false
            ),
            new Skill(
              '狙いすまし',
              60,
              '【防御時 / 防御陣時】\n次ターンの与クリティカル値+100、命中力+100%',
              false
            ),
            new Skill(
              '料理上手',
              20,
              '【敵を倒した攻撃時】\n対象の肉ドロップ確率+20%\nドナムによる攻撃では発動しない',
              false
            ),
            new Skill(
              'ステルス',
              5,
              '【ターン終了時】【最大10ターン】\n敵から狙われにくくなる',
              false
            ),
            new Skill(
              'ベストポジション',
              7,
              '【配置：後衛】【防御時 / 防御陣時】\n武器射程が適正で攻撃を受けると15%の確率で反撃\n反撃ダメージは100%、反撃応酬は2回まで',
              false
            ),
            new Skill(
              'スナイピング',
              27,
              '【配置：サポーター】【装備：百花弓】【攻撃時】\n所属カヴンのアタッカーが攻撃時に25%の確率で追撃\n追撃時の攻撃力は50%、最大1回発動',
              false
            ),
            new Skill(
              'モードチェンジ',
              10,
              '【習得】\n戦闘能力を強化するドナム「モードチェンジ」を習得する',
              false
            ),
            new Skill(
              'ワイドダブル',
              53,
              '【装備：百花弓】【攻撃時】\n30%の確率で2回グループ攻撃になる',
              false
            ),
            new Skill(
              '陽炎の舞',
              40,
              '【回避時】【最大250%】\n与クリティカル値+50\nターン経過でリセット',
              false
            ),
            new Skill(
              '泥撃耐性強化術',
              10,
              '【常時】\n泥撃属性耐性+15',
              false
            ),
            new Skill(
              '天賦の才',
              28,
              '【同系あり】\n攻撃を受ける際、ラーニング確率+55%',
              false
            ),
          ],
        ),
        new Facet(
          'magia_1',
          'magia',
          'マギアメイド',
          [
            new Skill(
              'ドナム学',
              50,
              '【配置：アタッカー】\nドナム攻撃の威力+15%、DP消費量+5%\n自身が戦闘不能になっている場合は発動しない',
              true
            ),
            new Skill(
              '戦場力学I',
              50,
              '【配置：アタッカー】【防御時 / 防御陣時】\nパワーソースが一定値増加\nダメージを受けた際は通常の3倍増加',
              true
            ),
            new Skill(
              '再生ノ法術',
              10,
              '【習得】\n回復系ドナム「再生ノ法術」を習得',
              false
            ),
            new Skill(
              'ドエムマスター',
              43,
              '【最大105%】\n攻撃を受ける度に防御力+15%',
              false
            ),
            new Skill(
              '平常心',
              13,
              '【常時】\n錯乱状態の自然回復速度アップ、錯乱耐性+20',
              false
            ),
            new Skill(
              '戦場蝕杖術',
              44,
              '【装備：蝕杖】【攻撃時】\n与クリティカル値+50\n武器射程が適正で攻撃を受けると20%の確率で反撃\n反撃ダメージは50%、反撃応酬は1回まで',
              false
            ),
            new Skill(
              'マギアシール',
              10,
              '【同系あり】【重複なし】\n防御時、自身の焔撃、泥撃、霧撃耐性+15\n防御陣時、効果の対象が所属カヴンになる',
              false
            ),
            new Skill(
              '硬化ノ法術',
              10,
              '【習得】\n防御力を強化するドナム「硬化ノ法術」を習得',
              false
            ),
            new Skill(
              '月蝕打',
              23,
              '【装備：蝕杖】【攻撃時】\n対象の防御力を25%無視する',
              false
            ),
            new Skill(
              '深淵耐性強化術',
              10,
              '【常時】\n深淵耐性+25',
              false
            ),
            new Skill(
              '軟化ノ法術',
              10,
              '【習得】\n敵の防御力をダウンさせるドナム「軟化ノ法術」を習得',
              false
            ),
            new Skill(
              '命の灯',
              56,
              '【同系あり】【戦闘中1回】【戦闘不能時】\n所属カヴンのアタッカーのHPを50%回復',
              false
            ),
            new Skill(
              'ドナムマスター',
              45,
              '【重複あり】\n所属カヴンがドナム攻撃を行う際、威力+8%',
              false
            ),
            new Skill(
              'ドナミスト',
              20,
              '【戦闘中】\n所属カヴンのDP消費量-30%、攻撃時の攻撃力-30%',
              false
            ),
            new Skill(
              'マギアシールII',
              20,
              '【同系あり】【重複なし】\n防御時、自身の焔撃、泥撃、霧撃耐性+30\n防御陣時、効果の対象が所属カヴンになる',
              false
            ),
          ],
        ),
        new Facet(
          'magia_2',
          'magia',
          'マギアコンシェリ',
          [
            new Skill(
              '戦場力学II',
              50,
              '【配置：サポーター】【HP100%】【重複あり】\nパワーソース増加量+5%',
              true
            ),
            new Skill(
              'ドナム効率化論',
              50,
              '【重複あり】\n所属カヴンのDP消費量-25%',
              true
            ),
            new Skill(
              'テイクオーバー',
              30,
              '【敵を倒した攻撃時】\n対象のアイテムドロップ率がアップ',
              false
            ),
            new Skill(
              '薬剤調合学',
              10,
              '【戦闘中】\n自身が回復アイテムを使用すると回復効果が2倍になる',
              false
            ),
            new Skill(
              '分析術',
              15,
              '【同系あり】\n攻撃を受ける際、ラーニング確率+30%',
              false
            ),
            new Skill(
              'マギアテンペスト',
              10,
              '【習得】\n敵に状態異常を付与するドナム「マギアテンペスト」を習得',
              false
            ),
            new Skill(
              '法術 – 目眩の霧',
              10,
              '【習得】\n敵の命中率を下げるドナム「法術 – 目眩の霧」を習得する',
              false
            ),
            new Skill(
              '魔封の肉呪文',
              24,
              '【常時】\n焔撃、泥撃、霧撃耐性+15',
              false
            ),
            new Skill(
              '法術 – 弱粘着術',
              10,
              '【習得】\n敵の行動速度を下げるドナム「法術 – 弱粘着術」を習得する',
              false
            ),
            new Skill(
              '深淵学',
              13,
              '【常時】\n深淵状態の自然回復速度アップ、深淵耐性+20',
              false
            ),
            new Skill(
              '深淵治癒術',
              5,
              '【常時】\n深淵状態の自然回復速度がアップ',
              false
            ),
            new Skill(
              '論理武装',
              21,
              '【HP100%】\n攻撃を受ける際のダメージを軽減する',
              false
            ),
            new Skill(
              'ドナム力自慢',
              10,
              '【常時】\nDMP+35%',
              false
            ),
            new Skill(
              '法術 – 攻撃弱体術',
              10,
              '【習得】\n敵の攻撃力を下げるドナム「法術 – 攻撃弱体術」を習得する',
              false
            ),
            new Skill(
              '因果律・魔',
              15,
              '【戦闘中】\n所属カヴンがドナムを行う際、1%の確率でDPを消費しない',
              false
            ),
          ],
        ),
        new Facet(
          'famew_1',
          'famew',
          'ファミュゥシーカー',
          [
            new Skill(
              'ニャンタマ',
              50,
              '【攻撃ヒット時】\n対象を激怒しづらくする、激怒状態の対象には無効',
              true
            ),
            new Skill(
              '卑見の見切り',
              50,
              '【HP5%以下】\n回避力+75%、命中率-75%',
              true
            ),
            new Skill(
              '野生の観察眼',
              5,
              '【HP15%以下】\n攻撃を受ける際のラーニング確率+50%',
              false
            ),
            new Skill(
              '野生の生命力',
              56,
              '【戦闘中】\n自身に蘇生アイテムが使われた際、蘇生時のHP回復量+50%\n蘇生アイテム以外の蘇生では発動しない',
              false
            ),
            new Skill(
              '人間観察',
              18,
              '【戦闘中】\n他者への友好度の増減量が1.75倍になる',
              false
            ),
            new Skill(
              '喉慣らし',
              4,
              '【防御時 / 防御陣時】\nHPを1%回復',
              false
            ),
            new Skill(
              'キャトラッシュ',
              63,
              '【装備マスタリーS+ / 片手斬撃】【未行動の敵へ攻撃時】\n20%で2-5回攻撃になる\n単体への攻撃に限る、対象の敵が激怒しやすくなる',
              false
            ),
            new Skill(
              '猫だまし',
              16,
              '【未行動の敵へ攻撃時】\n50%の確率で驚愕効果を付加する攻撃になる\n1体の対象につき1回のみ発動',
              false
            ),
            new Skill(
              'それゆけ便乗撃',
              9,
              '【配置：サポーター】【配置：追撃枠】\n追撃率+20%',
              false
            ),
            new Skill(
              '野生動作',
              10,
              '【常時】\n雷技のウェポンマスタリーを2-3段階強化',
              false
            ),
            new Skill(
              'トレジャーシーク',
              10,
              '【習得】\nドロップ率をアップするドナム「トレジャーシーク」を習得',
              false
            ),
            new Skill(
              '癒シ力',
              39,
              '【配置：サポーター】【ターン終了時】\n所属カヴン全員のHPを小回復\nアタッカーは1%、サポーターは3%回復する',
              false
            ),
            new Skill(
              '高速化',
              20,
              '【配置：アタッカー】【重複なし】\n所属カヴンのアタッカーの行動速度がアップ',
              false
            ),
            new Skill(
              '野生の身のこなし',
              45,
              '【同系あり】【盾を含む防具を一切装備しない】【HP100%】\n回避力が6倍になる\n装飾品は除く、部位のロスト状態を考慮しない',
              false
            ),
            new Skill(
              '研ギ澄マサレシ爪',
              5,
              '【配置：サポーター】【配置：追撃枠】\n追撃ダメージ+10%',
              false
            ),
          ],
        ),
        new Facet(
          'famew_2',
          'famew',
          'ファミュゥチェイサー',
          [
            new Skill(
              'キャッツアイ',
              50,
              '【LUC幸運】\n”非被弾タイプの行動”へのラーニング確率+30%',
              true
            ),
            new Skill(
              '幸運の瞳',
              50,
              '【配置：アタッカー】【戦闘終了時】【重複なし】\n生存していたらアイテムドロップ率がアップ',
              true
            ),
            new Skill(
              '援護攻撃',
              17,
              '【配置：アタッカー】【HP75%以上】\n共振率がアップ',
              false
            ),
            new Skill(
              '空中偵察',
              36,
              '【配置：サポーター】\n所属カヴンのアタッカーの命中率+10%',
              false
            ),
            new Skill(
              '回復呼吸法',
              7,
              '【HP75%以下】【ターン終了時】\nHPを1%回復',
              false
            ),
            new Skill(
              '幸運の輝き',
              50,
              '【配置：アタッカー】【重複あり】\n旅団内のアタッカーの運命力がアップ',
              false
            ),
            new Skill(
              '身代わり',
              20,
              '【戦闘中1回】【配置：サポーター】\n所属カヴンのアタッカーへの攻撃時に発動\n即死攻撃でアタッカーが死亡した際、自身を犠牲にし対象を蘇生',
              false
            ),
            new Skill(
              '超集中',
              80,
              '【防御時 / 防御陣時】\n次ターンの命中力+300%',
              false
            ),
            new Skill(
              '野生式逃走術',
              10,
              '【習得】\n逃走系ドナム「野生式逃走術」を習得する',
              false
            ),
            new Skill(
              '猛禽の爪',
              23,
              '【同系あり】\n星嵐鎌のウェポンマスタリーを6段階強化',
              false
            ),
            new Skill(
              'ツキアリ',
              24,
              '【LUC幸運以上】\n回避率+50%、与クリティカル値+10',
              false
            ),
            new Skill(
              '窮鼠の必中撃',
              15,
              '【HP10%以下】\n回避力-80%、命中率+150%',
              false
            ),
            new Skill(
              '直感ガード',
              9,
              '【LUC幸運以上】\nガード率+5%',
              false
            ),
            new Skill(
              '野生の匂い消し',
              4,
              '【配置：後衛】【ターン終了時】\n敵から狙われにくくなる',
              false
            ),
            new Skill(
              '孤立無援',
              15,
              '【戦闘中】\n同一ファセット(性別は無視)が旅団内のアタッカーにいないなら\n回避力+50%',
              false
            ),
          ],
        ),
        new Facet(
          'gothic_1',
          'gothic',
          'ゴシックコッペリア',
          [
            new Skill(
              'ダブルアタック',
              50,
              '【装備マスタリーS+ / 両手武器】【攻撃時】\n50%の確率で2回攻撃になる',
              true
            ),
            new Skill(
              'ぶん回しの剛腕',
              50,
              '【配置：前衛】【装備マスタリーS+ / 武器】【攻撃時】\nクリティカルダメージ+50%\nただし、隣に配置されている人形兵の友好度が大幅ダウン',
              true
            ),
            new Skill(
              '因果',
              10,
              '【戦闘中】\nクリティカル、被クリティカルの発生に因果数の影響を受ける',
              false
            ),
            new Skill(
              '自爆',
              10,
              '【敵の攻撃で戦闘不能になる】\n自爆し、敵全体にスタンダメージを与える\n全部位がロストする',
              false
            ),
            new Skill(
              '黒切斬',
              23,
              '【クリティカル攻撃時】\nクリティカル時80%の確率でゴア率が小アップ',
              false
            ),
            new Skill(
              '誘惑の魔眼',
              40,
              '【攻撃ヒット時】\n50%の確率で幻覚効果を付加する攻撃になる',
              false
            ),
            new Skill(
              '万能治療術',
              12,
              '【常時】\n全ての状態異常の自然回復速度が小アップ',
              false
            ),
            new Skill(
              '力タメ',
              20,
              '【防御時 / 防御陣時】\n次ターンの攻撃力+25%、与スタン値+1600',
              false
            ),
            new Skill(
              '腕自慢',
              10,
              '【常時】\nSTR+35%',
              false
            ),
            new Skill(
              '無慈悲な一撃',
              20,
              '【同系あり】【スタン中の敵への攻撃】\n与クリティカル値+100',
              false
            ),
            new Skill(
              '大暴れ怪力無双',
              6,
              '【装備マスタリーS+ / 両手武器】【攻撃時】\n武器射程が適正で攻撃を受ける際5%で反撃\n反撃は命中率が減少、クリティカル時ゴア率アップ\n反撃応酬は1回まで',
              false
            ),
            new Skill(
              '大黒切斬',
              8,
              '【HP30%以下】\nクリティカル時のゴア率が小アップ',
              false
            ),
            new Skill(
              '反ドナム思想',
              5,
              '【攻撃時】\n攻撃力+20%、所属カヴンのDP消費量+25%',
              false
            ),
            new Skill(
              'アナリスト',
              20,
              '【同系あり】\n攻撃を受ける際、ラーニング確率+40%',
              false
            ),
            new Skill(
              'ショックウェーブ',
              15,
              '【HP100%】【攻撃時】\n対象の防御力を25%無視する',
              false
            ),
          ],
        ),
        new Facet(
          'gothic_2',
          'gothic',
          'ゴシックグラトニア',
          [
            new Skill(
              'グラングラットン',
              50,
              '【装備：破砕砲 or マスタリーS+武器】【HP80%以上】\n攻撃力+5%、命中率+50%、与スタン値+700',
              true
            ),
            new Skill(
              '渾身撃',
              50,
              '【装備マスタリーS+：武器】【攻撃時】\n攻撃力+50%、攻撃毎にHPを5%消費',
              true
            ),
            new Skill(
              'フンバリ',
              10,
              '【同系あり】\nスタン耐性値+1200',
              false
            ),
            new Skill(
              '足払い',
              16,
              '【同系あり】\n与スタン値+600',
              false
            ),
            new Skill(
              '気功術',
              25,
              '【攻撃時】\n攻撃力+25%',
              false
            ),
            new Skill(
              '重撃',
              4,
              '【行動済みの敵への攻撃時】\n与スタン値+1600、行動速度は常時ダウン',
              false
            ),
            new Skill(
              '破砕砲術師範',
              19,
              '【常時】\n破砕砲のウェポンマスタリーを5段階強化',
              false
            ),
            new Skill(
              '硬化術',
              15,
              '【戦闘中】\n攻撃を受ける際の防御力+25%',
              false
            ),
            new Skill(
              'ラストアタック',
              56,
              '【装備：破砕砲 or S+両手武器】【HP100%】【攻撃時】\n旅団内最後の行動で発動\n与スタン値+3200、2-3回攻撃する',
              false
            ),
            new Skill(
              'リミッター解除',
              10,
              '【習得】\n戦闘能力を強化するドナム「リミッター解除」を習得する',
              false
            ),
            new Skill(
              '背徳の罪',
              18,
              '【HP30%以下】【攻撃ヒット時】\n錯乱効果を付加する\n錯乱効果の威力は旅団のカルマ値に依存する',
              false
            ),
            new Skill(
              'ピンチ力',
              10,
              '【連れ去り中の敵への攻撃時】\n与スタン値+3800',
              false
            ),
            new Skill(
              '見切りの運勢',
              8,
              '【LUC絶望中の絶望】\n回避力+35%',
              false
            ),
            new Skill(
              '再起動',
              56,
              '【戦闘中1回】【HP1%以下】【ターン終了時】\nHPを75%回復',
              false
            ),
            new Skill(
              '大衝撃砲',
              16,
              '【装備：破砕砲 or マスタリーS+武器】【HP100%】\n与スタン値+1200',
              false
            ),
          ],
        ),
        new Facet(
          'prima_1',
          'prima',
          'プリマリーパー',
          [
            new Skill(
              '星嵐舞踏',
              50,
              '【装備：星嵐鎌】【攻撃時】\n12%の確率で4回攻撃になる',
              true
            ),
            new Skill(
              '血風演舞',
              50,
              '【HP5%以下】\n攻撃力、回避力+100%、防御力、命中力-50%\nまた星嵐舞踏の発動確率+35%',
              true
            ),
            new Skill(
              'ウィッカーマン',
              15,
              '【戦闘中】\n自身のロストした部位×100%攻撃力がアップ',
              false
            ),
            new Skill(
              'ウィッカーズ',
              18,
              '【戦闘中】\n所属カヴン内の戦闘不能者数に応じて攻撃力がアップ\n戦闘不能者がアタッカーなら+50%、サポーターなら+20%',
              false
            ),
            new Skill(
              '深淵の申し子',
              45,
              '【戦闘中】\n自身が深淵状態なら、回避力が3倍になる',
              false
            ),
            new Skill(
              '艶声の悲鳴',
              5,
              '【同系あり】\n攻撃を受ける際、パワーソース増加量+10%',
              false
            ),
            new Skill(
              'ブラッドソーン',
              37,
              '【戦闘中】\n武器射程が適正で焔撃、泥撃、霧撃攻撃を受ける際15%で反撃\nターン中に自身が受けたダメージの合計を反撃ダメージに加算\n反撃応酬は1回まで',
              false
            ),
            new Skill(
              '悪ノ華',
              10,
              '【戦闘中】\n旅団のカルマ値を自身の運命力とする\nカルマが高いほど幸運になる',
              false
            ),
            new Skill(
              '虎視眈々',
              13,
              '【配置：サポーター】【配置：追撃枠】\n追撃率+30%',
              false
            ),
            new Skill(
              '黒ノ刃',
              30,
              '【HP30%以下】\n与クリティカル値+50',
              false
            ),
            new Skill(
              '血錆ビノ呪イ',
              50,
              '【戦闘中1回】【敵の攻撃で戦闘不能】\n戦闘不能にさせた対象の防御力-20%\n効果は3ターン続く',
              false
            ),
            new Skill(
              'ドラキュリア',
              15,
              '【クリティカル攻撃時】\n与えたダメージの10%HPを回復',
              false
            ),
            new Skill(
              'アニマスナッチ',
              10,
              '【習得】\n攻撃力を強化するドナム「アニマスナッチ」を習得',
              false
            ),
            new Skill(
              '当て勘の極意',
              18,
              '【同系あり】\n命中力+35%',
              false
            ),
            new Skill(
              'バトラーズハイ',
              15,
              '【回避時】【最大1回】\n与クリティカル値+50、攻撃を受けるとリセット',
              false
            ),
          ],
        ),
        new Facet(
          'prima_2',
          'prima',
          'プリマクピードー',
          [
            new Skill(
              'キューピット',
              50,
              '【戦闘中】【重複なし】\n所属カヴン内の友好度の増加量が1.5倍になる\nまた友好度が減少しなくなる',
              true
            ),
            new Skill(
              'ハイヒール',
              50,
              '【戦闘中】\n回復ドナムを使用する際、回復効果+25%',
              true
            ),
            new Skill(
              '見切り',
              15,
              '【同系あり】\n回避力+20%',
              false
            ),
            new Skill(
              'ゾーン',
              35,
              '【HP100%】\n命中率+50%',
              false
            ),
            new Skill(
              '善ノ華',
              18,
              '【戦闘中】\nカルマが0なら所属カヴンのリバレーション増加量+25%',
              false
            ),
            new Skill(
              '白ノ刃',
              33,
              '【常時】\n与クリティカル値+30',
              false
            ),
            new Skill(
              'プリマリボーン',
              10,
              '【習得】\n回復系ドナム「プリマリボーン」を習得する',
              false
            ),
            new Skill(
              '瞬速',
              35,
              '【HP100%】\n行動速度が大アップ',
              false
            ),
            new Skill(
              'パワードロップ',
              50,
              '【HP100%】【最大300%】\n自身の行動によるパワーソース増加量が変化\nパワーソース増加量+50%',
              false
            ),
            new Skill(
              '星嵐鎌術師範',
              15,
              '【同系あり】\n星嵐鎌のウェポンマスタリーを4段階強化',
              false
            ),
            new Skill(
              '臨戦態勢',
              9,
              '【HP30%以上】\n命中率+10%',
              false
            ),
            new Skill(
              '受け流し',
              30,
              '【戦闘中】\n攻撃を受ける際、敵の攻撃力-25%',
              false
            ),
            new Skill(
              'みかわしの開眼',
              26,
              '【同系あり】\n回避力+35%',
              false
            ),
            new Skill(
              '精神統一',
              10,
              '【同系あり】\n命中力+20%',
              false
            ),
            new Skill(
              '器用さ自慢',
              10,
              '【常時】\nDEX+35%',
              false
            ),
          ],
        ),
        new Facet(
          'fable_1',
          'fable',
          'フェイブルトリッカー',
          [
            new Skill(
              'ハッピーダンス',
              50,
              '【配置：アタッカー】【HP100%】【重複なし】\nレバレーション増加量+50%',
              true
            ),
            new Skill(
              'アフターフォロー',
              50,
              '【攻撃時】\n対象の敵は激怒しなくなる',
              true
            ),
            new Skill(
              '道化の見世物',
              10,
              '【習得】\n敵の激怒を解除するドナム「道化の見世物」を習得する',
              false
            ),
            new Skill(
              'マジック＆トリック',
              10,
              '【習得】\nステータス変化を解除するドナム「マジック＆トリック」を習得',
              false
            ),
            new Skill(
              '友情の証',
              10,
              '【HP1%以下】【攻撃時】\n共振率が特大アップ',
              false
            ),
            new Skill(
              '痛いの～飛んでけ♪',
              10,
              '【習得】\n回復系ドナム「痛いの～飛んでけ♪」を習得する',
              false
            ),
            new Skill(
              '蘇生蟲学・初級',
              37,
              '【戦闘中】\n自身が蘇生アイテムを使用する場合、蘇生時のHP回復量+50%',
              false
            ),
            new Skill(
              '薬剤調合学II',
              20,
              '【戦闘中】\n自身が回復アイテムを使用すると回復効果が3倍になる',
              false
            ),
            new Skill(
              'メンテナンス',
              18,
              '【配置：アタッカー】【重複なし】\n所属カヴン前のミラマキーナの出現ターン数が2倍になる',
              false
            ),
            new Skill(
              'クラスII',
              18,
              '【同系あり】【配置：アタッカー】【重複なし】\n所属カヴン前のミラマキーナの能力が1.5倍に強化される',
              false
            ),
            new Skill(
              'パニックサーカス',
              10,
              '【習得】\n敵に状態異常を付与するドナム「パニックサーカス」を習得する',
              false
            ),
            new Skill(
              'おっかけ攻撃',
              7,
              '【配置：サポーター】【配置：追撃枠】【HP100%】\n追撃率+20%',
              false
            ),
            new Skill(
              'モブ化',
              5,
              '【HP30%以下】\n敵から狙われにくくなる',
              false
            ),
            new Skill(
              '蘇生蟲学・上級',
              56,
              '【戦闘中】\n自身が蘇生アイテムを使用する場合、蘇生時のHP回復量+75%',
              false
            ),
            new Skill(
              'クラスIII',
              25,
              '【同系あり】【配置：アタッカー】【重複なし】\n所属カヴン前のミラマキーナの能力が2倍に強化される',
              false
            ),
          ],
        ),
        new Facet(
          'fable_2',
          'fable',
          'フェイブルエクリプス',
          [
            new Skill(
              '黒のビオトープ',
              50,
              '【戦闘中】\n所属カヴンの戦闘不能者数に応じて\n攻撃力、防御力、命中力、回避力が上昇していくが\n初期値はそれぞれ半減状態となる',
              true
            ),
            new Skill(
              'エンダー',
              50,
              '【戦闘中】\n旅団内のアタッカーが自身のみなら\n攻撃力+100%、与クリティカル+100\nただし、防御力、命中力、回避力-75%',
              true
            ),
            new Skill(
              '傀儡子のおちょくり',
              3,
              '【攻撃ヒット時】\n対象の敵から狙われやすくなり、激怒しやすくなる',
              false
            ),
            new Skill(
              '速射の心得',
              27,
              '【装備：破砕砲】【攻撃時】\n25%の確率で2回攻撃になる\nただし、戦闘中は常時命中力が-20%される',
              false
            ),
            new Skill(
              'みんな元気元気♪',
              10,
              '【習得】\nスタン蓄積を回復するドナム「みんな元気元気♪」を習得',
              false
            ),
            new Skill(
              '無観測射撃',
              16,
              '【配置：サポーター】【配置：追撃枠】【装備：破砕砲】\n追撃率+50%、追撃ダメージ+25%\nただし、命中率は0.5倍になる',
              false
            ),
            new Skill(
              '偏重耐性',
              5,
              '【常時】\n焔撃、泥撃、霧撃耐性+5%、斬、打、貫耐性-5%',
              false
            ),
            new Skill(
              'エクリプスライト',
              10,
              '【習得】\n状態異常耐性を強化させるドナム「エクリプスライト」を習得',
              false
            ),
            new Skill(
              '走馬の見切り',
              4,
              '【HP3%以上】【HP8%以下】\n攻撃を受ける際、ラーニング率+75%',
              false
            ),
            new Skill(
              'キワドイ大道芸',
              7,
              '【配置：サポーター】【HP25%以下】【ターン終了時】\n所属カヴンのアタッカーのHPを5%回復',
              false
            ),
            new Skill(
              '月蝕光',
              10,
              '【習得】\n敵に状態異常を付与するドナム「月蝕光」を習得する',
              false
            ),
            new Skill(
              '腰だめの極意',
              10,
              '【装備：破砕砲 or マスタリーS+両手武器】\nスタン耐性値+800、命中力+50%\nただし、回避力-50%',
              false
            ),
            new Skill(
              'マジカルシアター',
              50,
              '【常時】\n行動速度が大アップ',
              false
            ),
            new Skill(
              '金環の加護',
              10,
              '【習得】\n魔撃に反撃するドナム「金環の加護」を習得する',
              false
            ),
            new Skill(
              'エクリプス',
              70,
              '【戦闘中】\n同一ファセットが旅団内アタッカーにいないなら\n攻撃力、防御力、回避力、命中力が+30%\nいる場合は-25%、さらに友好度も下がりやすくなる',
              false
            ),
          ],
        ),
        new Facet(
          'am_1',
          'am',
          'アムアルキュミア',
          [
            new Skill(
              '影ノ花',
              50,
              '【攻撃ヒット時】\n直前の行動キャラが味方なら、対象キャラが狙われやすくなる',
              true
            ),
            new Skill(
              '刀剣舞踏',
              50,
              '【装備マスタリーS+：刀剣】【HP80%以上】【攻撃時】\n35%の確率でグループ攻撃に変化',
              true
            ),
            new Skill(
              'キュベリア',
              54,
              '【装備マスタリーS+：片手装備】【物理攻撃を回避時】\n武器射程が適正で攻撃を受けると80%の確率で反撃\n反撃ダメージは300%、反撃応酬は5回まで',
              false
            ),
            new Skill(
              '薔薇のルージュ',
              10,
              '【攻撃時】\n死亡ダメージを与える場合、対象のHPが1残る\n対象のHPが1の場合は1ダメージを与えて倒す',
              false
            ),
            new Skill(
              'スピード自慢',
              10,
              '【常時】\nAGI+35%',
              false
            ),
            new Skill(
              '絶対回避',
              10,
              '【習得】\n回避力を強化させるドナム「絶対回避」を習得する',
              false
            ),
            new Skill(
              '牽制',
              36,
              '【攻撃ヒット時】【重複なし】\n25%の確率で対象の命中力、回避力-50%\n効果は3ターン続く',
              false
            ),
            new Skill(
              '魔眼の見切り',
              12,
              '【配置：サポーター】【重複なし】\n所属カヴンのアタッカーの反撃確率+10%、反撃応酬+2回',
              false
            ),
            new Skill(
              'キャストオフ',
              5,
              '【常時】\n行動速度がアップするが、最大HPが50%になる\n戦闘以外でも有効',
              false
            ),
            new Skill(
              '薄氷の見切り',
              4,
              '【回避時】【最大25】\n与クリティカル値+5、攻撃を受けたらリセット',
              false
            ),
            new Skill(
              '革命剣技',
              10,
              '【HP5%以下】\n共振発生時の与クリティカル値+100',
              false
            ),
            new Skill(
              '抜刀の歩',
              10,
              '【装備：刀剣】【装備：片手なし】\n行動速度がアップする',
              false
            ),
            new Skill(
              'キラメキノ一番星',
              25,
              '【戦闘中】\n全キャラ中最初の行動なら、必ずクリティカルが発生する',
              false
            ),
            new Skill(
              '革命の機運',
              30,
              '【同系あり】【回避時】【最大225%】\n攻撃力+75%、攻撃を受けたらリセット',
              false
            ),
            new Skill(
              '血煙ノ愉悦',
              56,
              '【敵を倒した攻撃時】\nHPを25%回復',
              false
            ),
          ],
        ),
        new Facet(
          'am_2',
          'am',
          'アムアルテア',
          [
            new Skill(
              'エンプレス',
              50,
              '【HP100%】【激怒状態の敵への攻撃時】\nダメージが1.5倍、50%の確率で敵の激怒が終了する',
              true
            ),
            new Skill(
              '媚態自慢',
              10,
              '【戦闘中】\nERS+35%、戦闘開始時、敵から非常に狙われやすくなる',
              true
            ),
            new Skill(
              '死角渡り',
              3,
              '【配置：前衛】【ターン毎】\n敵から少し狙われにくくなる',
              false
            ),
            new Skill(
              '千載一遇必殺撃',
              30,
              '【同系あり】【回避時】【最大200%】\n攻撃力+100%、攻撃を受けたらリセット',
              false
            ),
            new Skill(
              '関節の極意',
              23,
              '【同系あり】【装備：雷技】【攻撃時】\n対象の防御力を25%無視する',
              false
            ),
            new Skill(
              'クイックステップ',
              10,
              '【習得】\n行動速度を強化するドナム「クイックステップ」を習得する',
              false
            ),
            new Skill(
              '戦場格闘術',
              40,
              '【装備：雷技】【装備：刀剣】【スタン中の敵への攻撃時】\n与クリティカル値+100',
              false
            ),
            new Skill(
              '手負いの獣',
              8,
              '【戦闘中】\n自身にロストした部位がある時、攻撃力+50%',
              false
            ),
            new Skill(
              '格闘王',
              9,
              '【戦闘中】【装備：雷技】\n友好度の増減量が1.25倍になる\nS+雷技の時、友好度の増減量は1.75倍となる',
              false
            ),
            new Skill(
              'デスゾーン',
              25,
              '【HP25%以下】\nガード率+15%、回避力+50%',
              false
            ),
            new Skill(
              'エンドルフィン',
              19,
              '【ゴア発生攻撃時】\n与えたダメージの10%分自身のHPを回復',
              false
            ),
            new Skill(
              '雷撃タックル',
              13,
              '【装備：雷技】\n与スタン値+1400、ただし被クリティカル値-20',
              false
            ),
            new Skill(
              '高速ステップ',
              20,
              '【装備：足装備なし】\n行動速度が大アップ',
              false
            ),
            new Skill(
              '血眼の術許し',
              50,
              '【配置：後衛】\n非被弾タイプの行動へのラーニング確率+30%',
              false
            ),
            new Skill(
              'ファッシネイト',
              50,
              '【装備マスタリーS+：雷技】【HP100%】\n50%の確率で幻覚効果を付加する攻撃になる\n強敵以上には効かない',
              false
            ),
          ],
        ),
      ],
    }
  },
  methods: {
    topHeight() {
      return this.$refs.top.clientHeight;
    },
    clickGoFirst(e) {
      e.preventDefault();
      if (this.firstFacetId) {
        this.$scrollTo(`#${this.firstFacetId}`, {offset: -this.topHeight() - 5});
      }
    },
    clickGoLast(e) {
      e.preventDefault();
      if (this.lastFacetId) {
        this.$scrollTo(`#${this.lastFacetId}`, {offset: -this.topHeight() - 5});
      }
    },
    clickSkill(e) {
      e.preventDefault();
      const idx = e.currentTarget.dataset.idx;
      const idx2 = e.currentTarget.dataset.idx2;
      this.facets[idx].skills[idx2].isChecked = !this.facets[idx].skills[idx2].isChecked;
    },
    clickSkillSpecial(e) {
      e.preventDefault();
      const idx = e.currentTarget.dataset.idx;
      const idx2 = e.currentTarget.dataset.idx2;
      if (!this.facets[idx].skills[idx2].isSpecial) {
        const isCheckedSpecial = this.facets[idx].skills[idx2].isCheckedSpecial;
        this.facets[idx].skills.forEach(skill => skill.isCheckedSpecial = false);
        this.facets[idx].skills[idx2].isCheckedSpecial = !isCheckedSpecial;
      }
    },
  },
  computed: {
    firstFacet() {
      const facet = this.facets.find(facet => facet.id === this.firstFacetId);
      if (facet) return facet;
      return null;
    },
    lastFacet() {
      const facet = this.facets.find(facet => facet.id === this.lastFacetId);
      if (facet) return facet;
      return null;
    },
    totalCost() {
      let cost = 0;
      this.facets.forEach((facet) => {
        facet.skills.forEach((skill) => {
          if (skill.isChecked) {
            if (skill.isSpecial && this.lastFacet !== null && facet.type === this.lastFacet.type) {
              cost += 0;
            } else if (skill.isCheckedSpecial && this.lastFacet !== null && facet.id === this.lastFacet.id) {
              cost += 0;
            } else if (this.firstFacet !== null && facet.id === this.firstFacet.id) {
              cost += skill.firstCost;
            } else if (this.lastFacet !== null && facet.type === this.lastFacet.type) {
              cost += skill.lastCost;
            } else {
              cost += skill.cost;
            }
          }
        });
      });
      return cost;
    },
    checkedSkills() {
      let checkedSkills = '';
      this.facets.forEach((facet) => {
        const skills = facet.skills.filter(skill => skill.isChecked);
        if (skills.length) {
          checkedSkills += `\n■${facet.name}\n`;
          skills.forEach((skill) => {
            let cost = 0;
            let checkedSpecial = '';
            if (skill.isSpecial && this.lastFacet !== null && facet.type === this.lastFacet.type) {
              cost = 0;
            } else if (skill.isCheckedSpecial && this.lastFacet !== null && facet.id === this.lastFacet.id) {
              cost = 0;
              checkedSpecial = '【選択】';
            } else if (this.firstFacet !== null && facet.id === this.firstFacet.id) {
              cost = skill.firstCost;
            } else if (this.lastFacet !== null && facet.type === this.lastFacet.type) {
              cost = skill.lastCost;
            } else {
              cost = skill.cost;
            }
            checkedSkills += `${checkedSpecial}${skill.name} (${cost})\n`;
          });
        }
      });
      return checkedSkills;
    },
    modalText() {
      let modalText = '';

      modalText += '初期: ';
      if (this.firstFacet) modalText += this.firstFacet.name;
      modalText += '\n';

      modalText += '最終: ';
      if (this.lastFacet) modalText += this.lastFacet.name;
      modalText += '\n';

      modalText += `コスト: ${this.totalCost} / ${this.maxCost}\n`;

      modalText += this.checkedSkills;

      return modalText;
    },
  },
}
</script>

<style scoped>
.top {
  background-color: white;
}
.top-btn {
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1030;
}
.facet-wrapper {
  margin-top: 58px;
}

@media screen and (max-width: 991px) {
  .facet-wrapper {
    margin-top: 138px;
  }
}

/deep/ #modal1 .modal-body {
  height: 75vh;
}

.skill {
  font-size: 80%;
}
.skill-check {
  width: 24px;
  padding: 0.25rem;
  font-size: 110%;
}
.skill-name {
  width: 148px;
  padding: 0.25rem;
}
.skill-desc {
  font-size: 90%;
  text-align: left;
  padding: 0.25rem;
  white-space: pre-wrap;
}
.skill-cost {
  width: 28px;
  padding: 0.25rem;
}

@media screen and (max-width: 575px) {
  .container-fluid {
    font-size: 85%;
  }
  .skill-name {
    width: 100px;
  }
}
</style>
