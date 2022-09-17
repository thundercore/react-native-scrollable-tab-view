import React, {PureComponent} from 'react';
const PropTypes = require('prop-types');
import {
  View,
  Animated,
  StyleSheet,
  ScrollView,
  Text,
  Platform,
  Dimensions,
} from 'react-native';
import {ViewPropTypes, TextPropTypes} from 'deprecated-react-native-prop-types';
const Button = require('./Button');

const WINDOW_WIDTH = Dimensions.get('window').width;

export default class ScrollableTabBar extends PureComponent {
  static propTypes = {
    goToPage: PropTypes.func,
    activeTab: PropTypes.number,
    tabs: PropTypes.array,
    backgroundColor: PropTypes.string,
    activeTextColor: PropTypes.string,
    inactiveTextColor: PropTypes.string,
    activeTextFontSize: PropTypes.number,
    inactiveTextFontSize: PropTypes.number,
    activeTextFontWeight: PropTypes.string,
    inactiveTextFontWeight: PropTypes.string,
    scrollOffset: PropTypes.number,
    style: ViewPropTypes.style,
    tabStyle: ViewPropTypes.style,
    tabsContainerStyle: ViewPropTypes.style,
    textStyle: TextPropTypes.style,
    renderTab: PropTypes.func,
    underlineStyle: ViewPropTypes.style,
    onScroll: PropTypes.func,
  };

  static defaultProps = {
    scrollOffset: 52,
    activeTextColor: 'navy',
    inactiveTextColor: 'black',
    activeTextFontSize: 25,
    inactiveTextFontSize: 25,
    activeTextFontWeight: 'bold',
    inactiveTextFontWeight: 'normal',
    backgroundColor: null,
    style: {},
    tabStyle: {},
    tabsContainerStyle: {},
    underlineStyle: {},
  };

  constructor(props) {
    super(props);
    this._tabsMeasurements = [];
    this.state = {
      _leftTabUnderline: new Animated.Value(0),
      _widthTabUnderline: new Animated.Value(0),
      _containerWidth: null,
    }
  }

  componentDidMount() {
    this.props.scrollValue.addListener(this.updateView);
  }

  updateView = (offset) => {
    const position = Math.floor(offset.value);
    const pageOffset = offset.value % 1;
    const tabCount = this.props.tabs.length;
    const lastTabPosition = tabCount - 1;

    if (tabCount === 0 || offset.value < 0 || offset.value > lastTabPosition) {
      return;
    }

    if (this.necessarilyMeasurementsCompleted(position, position === lastTabPosition)) {
      this.updateTabPanel(position, pageOffset);
      this.updateTabUnderline(position, pageOffset, tabCount);
    }
  }


  necessarilyMeasurementsCompleted = (position, isLastTab) => {
    return this._tabsMeasurements[position] &&
        (isLastTab || this._tabsMeasurements[position + 1]) &&
        this._tabContainerMeasurements &&
        this._containerMeasurements;
  }


  updateTabPanel = (position, pageOffset) => {
    const containerWidth = this._containerMeasurements.width;
    const tabWidth = this._tabsMeasurements[position].width;
    const nextTabMeasurements = this._tabsMeasurements[position + 1];
    const nextTabWidth = nextTabMeasurements && nextTabMeasurements.width || 0;
    const tabOffset = this._tabsMeasurements[position].left;
    const absolutePageOffset = pageOffset * tabWidth;
    let newScrollX = tabOffset + absolutePageOffset;

    // center tab and smooth tab change (for when tabWidth changes a lot between two tabs)
    newScrollX -= (containerWidth - (1 - pageOffset) * tabWidth - pageOffset * nextTabWidth) / 2;
    newScrollX = newScrollX >= 0 ? newScrollX : 0;

    if (Platform.OS === 'android') {
      this._scrollView.scrollTo({x: newScrollX, y: 0, animated: false, });
    } else {
      const rightBoundScroll = this._tabContainerMeasurements.width - (this._containerMeasurements.width);
      newScrollX = newScrollX > rightBoundScroll ? rightBoundScroll : newScrollX;
      this._scrollView.scrollTo({x: newScrollX, y: 0, animated: false, });
    }
  }

  updateTabUnderline = (position, pageOffset, tabCount) => {
    const lineLeft = this._tabsMeasurements[position].left;
    const lineRight = this._tabsMeasurements[position].right;

    if (position < tabCount - 1) {
      const nextTabLeft = this._tabsMeasurements[position + 1].left;
      const nextTabRight = this._tabsMeasurements[position + 1].right;

      const newLineLeft = (pageOffset * nextTabLeft + (1 - pageOffset) * lineLeft);
      const newLineRight = (pageOffset * nextTabRight + (1 - pageOffset) * lineRight);

      this.state._leftTabUnderline.setValue(newLineLeft);
      this.state._widthTabUnderline.setValue(newLineRight - newLineLeft);
    } else {
      this.state._leftTabUnderline.setValue(lineLeft);
      this.state._widthTabUnderline.setValue(lineRight - lineLeft);
    }
  }

  renderTab = (name, page, isTabActive, onPressHandler, onLayoutHandler) => {
    const { activeTextColor, inactiveTextColor, textStyle, activeTextFontSize, inactiveTextFontSize, activeTextFontWeight, inactiveTextFontWeight } = this.props;
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const textFontSize = isTabActive? activeTextFontSize : inactiveTextFontSize;
    const fontWeight = isTabActive ? activeTextFontWeight : inactiveTextFontWeight;

    return <Button
        key={`${name}_${page}`}
        accessible={true}
        accessibilityLabel={name}
        accessibilityTraits='button'
        onPress={() => onPressHandler(page)}
        onLayout={onLayoutHandler}
    >
      <View style={[styles.tab, this.props.tabStyle, ]}>
        <Text style={[{color: textColor, fontSize: textFontSize, fontWeight, }, textStyle, ]}>
          {name}
        </Text>
      </View>
    </Button>;
  }

  measureTab = (page, event) => {
    const { x, width, height, } = event.nativeEvent.layout;
    this._tabsMeasurements[page] = {left: x, right: x + width, width, height, };
    this.updateView({value: this.props.scrollValue.__getValue(), });
  }


  onTabContainerLayout = (e) => {
    this._tabContainerMeasurements = e.nativeEvent.layout;
    let width = this._tabContainerMeasurements.width;
    if (width < WINDOW_WIDTH) {
      width = WINDOW_WIDTH;
    }
    this.setState({ _containerWidth: width, });
    this.updateView({value: this.props.scrollValue.__getValue(), });
  }

  onContainerLayout = (e) => {
    this._containerMeasurements = e.nativeEvent.layout;
    this.updateView({value: this.props.scrollValue.__getValue(), });
  }

  render() {
    const containerWidth = this.props.containerWidth;
    const numberOfTabs = this.props.tabs.length;
    const tabUnderlineStyle = {
      position: 'absolute',
      // height: 4,
      backgroundColor: 'navy',
      bottom: 0,
    };

    const dynamicTabUnderline = {
      left: this.state._leftTabUnderline,
      width: this.state._widthTabUnderline,
    };

    const {
      onScroll,
    } = this.props;

    const translateX = this.props.scrollValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0,  containerWidth / numberOfTabs],
    });

    return <View
        style={[styles.container, {backgroundColor: this.props.backgroundColor, }, this.props.style, ]}
        onLayout={this.onContainerLayout}
    >
      <ScrollView
          ref={(scrollView) => { this._scrollView = scrollView; }}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          directionalLockEnabled={true}
          bounces={false}
          scrollsToTop={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
      >
        <View
            style={[styles.tabs, {width: this.state._containerWidth, }, this.props.tabsContainerStyle, ]}
            ref={'tabContainer'}
            onLayout={this.onTabContainerLayout}
        >
          {this.props.tabs.map((name, page) => {
            const isTabActive = this.props.activeTab === page;
            const renderTab = this.props.renderTab || this.renderTab;
            return renderTab(name, page, isTabActive, this.props.goToPage, this.measureTab.bind(this, page));
          })}
          <Animated.View style={[tabUnderlineStyle, {backgroundColor:'transparent'}, dynamicTabUnderline]} >
            <View style={[{flex:1, height: 4}, this.props.underlineStyle ]} >

            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>;
  }

  componentDidUpdate(prevProps) {
    // If the tabs change, force the width of the tabs container to be recalculated
    if (JSON.stringify(prevProps.tabs) !== JSON.stringify(this.props.tabs) && this.state._containerWidth) {
      this.setState({ _containerWidth: null, });
    }
  }
}

const styles = StyleSheet.create({
  tab: {
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  container: {
    height: 50,
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#ccc',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
