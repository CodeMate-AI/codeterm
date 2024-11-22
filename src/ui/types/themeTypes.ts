export interface ThemeColors {
    bgColor: string;
    textColor: string;
    primaryTextColor: string;
    secondaryTextColor: string;
    cursorColor: string;
    selectionBackgroundColor: string;
    commentColor: string;
    redColor: string;
    darkRedColor: string;         // Added dark red color
    orangeColor: string;
    yellowColor: string;
    greenColor: string;
    darkGreenColor: string;       // Added dark green color
    purpleColor: string;
    cyanColor: string;
    pinkColor: string;
    blueColor: string;
    darkBlueColor: string;        // Added dark blue color
    borderColor: string;
    grayColor: string;
    lightGrayColor: string;
    darkGrayColor: string;
    shadowColor: string;
    shadowColorLight: string;
}

export interface CustomTheme {
    themeName: string;
    colors: ThemeColors;
}