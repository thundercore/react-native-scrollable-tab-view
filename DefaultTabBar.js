import React, {PureComponent} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';
import {ViewPropTypes, TextPropTypes} from 'deprecated-react-native-prop-types';
const PropTypes = require('prop-types');
const Button = require('./Button');

export default class DefaultTabBar extends PureComponent {
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
    textStyle: TextPropTypes.style,
    tabStyle: ViewPropTypes.style,
    renderTab: PropTypes.func,
    underlineStyle: ViewPropTypes.style,
  };

  static defaultProps = {
    activeTextColor: 'navy',
    inactiveTextColor: 'black',
    activeTextFontSize: 25,
    inactiveTextFontSize: 25,
    backgroundColor: null,
    activeTextFontWeight: 'bold',
    inactiveTextFontWeight: 'normal',
  };

  renderTabOption = (name, page) => {

  };

  renderTab = (name, page, isTabActive, onPressHandler) => {
    const { activeTextColor, inactiveTextColor, textStyle, activeTextFontSize, inactiveTextFontSize, activeTextFontWeight, inactiveTextFontWeight} = this.props;
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const textFontSize = isTabActive? activeTextFontSize : inactiveTextFontSize;
    const fontWeight = isTabActive ? activeTextFontWeight : inactiveTextFontWeight;

    return <Button
      style={{flex: 1, }}
      key={name}
      accessible={true}
      accessibilityLabel={name}
      accessibilityTraits='button'
      onPress={() => onPressHandler(page)}
    >
      <View style={[styles.tab, this.props.tabStyle, ]}>
        <Text style={[{color: textColor, fontSize: textFontSize, fontWeight, }, textStyle, ]}>
          {name}
        </Text>
      </View>
    </Button>;
  };

  render() {
    const containerWidth = this.props.containerWidth;
    const numberOfTabs = this.props.tabs.length;
    const tabUnderlineStyle = {
      position: 'absolute',
      width: containerWidth / numberOfTabs,
      backgroundColor: 'navy',
      bottom: 0,
    };

    const translateX = this.props.scrollValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0,  containerWidth / numberOfTabs],
    });
    return (
      <View style={[styles.tabs, {backgroundColor: this.props.backgroundColor, }, this.props.style ]}>
        {this.props.tabs.map((name, page) => {
          const isTabActive = this.props.activeTab === page;
          const renderTab = this.props.renderTab || this.renderTab;
          return renderTab(name, page, isTabActive, this.props.goToPage);
        })}
        <Animated.View style={[tabUnderlineStyle,{backgroundColor:'transparent'}, { transform: [
            { translateX },
          ] }]} >
          <View style={[tabUnderlineStyle, {height: 4}, this.props.underlineStyle ]} >

          </View>
        </Animated.View>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  tabs: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#ccc',
  },
});
