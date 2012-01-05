#ifndef   BROWSER_H
#  define BROWSER_H

#  include <QtGui>
#  include <QWebView>
#  include <QDialog>

#  include "bridge.h"


class Browser : public QMainWindow
{
    Q_OBJECT

public:
    Browser(const QUrl& url, bool showInspector);
    virtual ~Browser();

public:
    QNetworkCookieJar* getNetworkCookieJar();

protected slots:
    void loaded(bool status);
    void voidSlot() {}

private:
    QWebView*	webview;
    Bridge*   bridge;

    QDialog* inspectorDialog;
};

#endif // BROWSER_H
